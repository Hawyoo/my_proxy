// Clash Verge Rev / Mihomo 全局扩展脚本
// 仓库：https://github.com/Hawyoo/my_proxy
// 顺序：自定义拒绝 > OpenAI 日本节点 > 自定义直连 > 自定义代理 > 原订阅规则

function addProvider(config, name, file) {
  if (!config["rule-providers"]) {
    config["rule-providers"] = {};
  }
  config["rule-providers"][name] = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/" + file,
    path: "./providers/" + name + ".txt",
    interval: 86400
  };
}

function main(config) {
  const groups = Array.isArray(config["proxy-groups"])
    ? config["proxy-groups"] : [];

  // 优先使用截图里的准确组名；兼容同名组前存在空格等轻微变化。
  const japan = groups.find(g => g.name === "🇯🇵日本节点")
    || groups.find(g => g.type === "url-test"
      && typeof g.name === "string" && g.name.indexOf("日本节点") !== -1);
  const manual = groups.find(g => g.name === "🚀节点选择")
    || groups.find(g => g.name === "节点选择")
    || groups.find(g => g.type === "select"
      && typeof g.name === "string" && g.name.indexOf("节点选择") !== -1);

  const managedNames = ["REJECT", "OPENAI", "DIRECT", "PROXY"];
  const original = Array.isArray(config.rules) ? config.rules : [];
  // 避免订阅刷新或重复执行时不断追加同一套规则。
  const untouched = original.filter(rule =>
    typeof rule !== "string" || !managedNames.some(name =>
      rule.indexOf("RULE-SET," + name + ",") === 0));

  const prepend = [];
  addProvider(config, "REJECT", "REJECT");
  prepend.push("RULE-SET,REJECT,REJECT");

  if (japan) {
    addProvider(config, "OPENAI", "OPENAI.txt");
    prepend.push("RULE-SET,OPENAI," + japan.name);
  } else {
    console.warn("[my_proxy] 未找到日本 URLTest 组；OpenAI 专用分流未启用。");
  }

  addProvider(config, "DIRECT", "DIRECT.txt");
  prepend.push("RULE-SET,DIRECT,DIRECT");

  if (manual) {
    addProvider(config, "PROXY", "PROXY");
    prepend.push("RULE-SET,PROXY," + manual.name);
  } else {
    console.warn("[my_proxy] 未找到节点选择 Selector 组；自定义 PROXY 规则未启用。");
  }

  config.rules = prepend.concat(untouched);
  return config;
}
