// Clash Verge Rev / Mihomo 全局扩展脚本
// https://github.com/Hawyoo/my_proxy
// 自定义 REJECT > OPENAI_JP > GOOGLE_JP > Google/YouTube 补充域名集 > DIRECT > PROXY > 原订阅规则
// 全部地区专属规则仅在 Rule（规则）模式下生效。

function addTextProvider(config, name, file) {
  config["rule-providers"] = config["rule-providers"] || {};
  config["rule-providers"][name] = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/" + file,
    path: "./providers/" + name + ".txt",
    interval: 86400
  };
}

// 使用 Mihomo 官方配置示例引用的 MetaCubeX 社区自动更新规则，补充 Google 和 YouTube 域名。
// 不会取代仓库内的 GOOGLE_JP.txt，二者都绑定到同一个日本 URLTest 组。
function addGeoProvider(config, name, category) {
  config["rule-providers"] = config["rule-providers"] || {};
  config["rule-providers"][name] = {
    type: "http",
    behavior: "domain",
    format: "mrs",
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/" + category + ".mrs",
    path: "./providers/" + name + ".mrs",
    interval: 86400
  };
}

function main(config) {
  const groups = Array.isArray(config["proxy-groups"])
    ? config["proxy-groups"] : [];

  // 选择现有的日本 URLTest，不改变该组的节点、过滤表达式和测速设置。
  const japan = groups.find(g => g.name === "🇯🇵日本节点" && g.type === "url-test")
    || groups.find(g => g.type === "url-test"
      && typeof g.name === "string" && g.name.indexOf("日本节点") !== -1);
  const manual = groups.find(g => g.name === "🚀节点选择" && g.type === "select")
    || groups.find(g => g.name === "节点选择" && g.type === "select")
    || groups.find(g => g.type === "select"
      && typeof g.name === "string" && g.name.indexOf("节点选择") !== -1);

  // 清除本脚本上一版插入的 OPENAI 规则，防止升级/重复执行后重复分流。
  const managedNames = [
    "REJECT", "OPENAI", "OPENAI_JP", "GOOGLE_JP",
    "GOOGLE_JP_SITE", "GOOGLE_JP_YOUTUBE",
    "DIRECT", "PROXY"
  ];
  const original = Array.isArray(config.rules) ? config.rules : [];
  const untouched = original.filter(rule =>
    typeof rule !== "string" || !managedNames.some(name =>
      rule.indexOf("RULE-SET," + name + ",") === 0));

  const prepend = [];

  addTextProvider(config, "REJECT", "REJECT");
  prepend.push("RULE-SET,REJECT,REJECT");

  if (japan) {
    addTextProvider(config, "OPENAI_JP", "OPENAI_JP.txt");
    prepend.push("RULE-SET,OPENAI_JP," + japan.name);

    addTextProvider(config, "GOOGLE_JP", "GOOGLE_JP.txt");
    prepend.push("RULE-SET,GOOGLE_JP," + japan.name);

    addGeoProvider(config, "GOOGLE_JP_YOUTUBE", "youtube");
    prepend.push("RULE-SET,GOOGLE_JP_YOUTUBE," + japan.name);

    addGeoProvider(config, "GOOGLE_JP_SITE", "google");
    prepend.push("RULE-SET,GOOGLE_JP_SITE," + japan.name);
  } else {
    console.warn("[my_proxy] 未找到日本 URLTest 组；OpenAI/Google 日本分流未启用。");
  }

  addTextProvider(config, "DIRECT", "DIRECT.txt");
  prepend.push("RULE-SET,DIRECT,DIRECT");

  if (manual) {
    addTextProvider(config, "PROXY", "PROXY");
    prepend.push("RULE-SET,PROXY," + manual.name);
  } else {
    console.warn("[my_proxy] 未找到 Selector 节点选择组；自定义 PROXY 规则未启用。");
  }

  config.rules = prepend.concat(untouched);
  return config;
}
