// Clash Verge Rev / Mihomo 全局扩展脚本
// 直接复制本文件全部内容到 Clash Verge 的 JavaScript 扩展脚本。
//
// 规则最终优先级：
// REJECT > OPENAI_JP > GOOGLE_JP > Google/YouTube 补充 > DIRECT > PROXY > 原订阅规则
//
// 注意：下方函数在 main() 中按相反顺序调用，因为 unshift() 会将规则插入最前面。

function addDirect(config) {
  const directProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/DIRECT.txt",
    path: "./providers/DIRECT.txt",
    interval: 86400
  };
  config["rule-providers"]["DIRECT"] = directProvider;
  config.rules.unshift("RULE-SET,DIRECT,DIRECT");
}

function addReject(config) {
  const rejectProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/REJECT.txt",
    path: "./providers/REJECT.txt",
    interval: 86400
  };
  config["rule-providers"]["REJECT"] = rejectProvider;
  config.rules.unshift("RULE-SET,REJECT,REJECT");
}

function addProxy(config, manualGroup) {
  const proxyProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/PROXY.txt",
    path: "./providers/PROXY.txt",
    interval: 86400
  };
  config["rule-providers"]["PROXY"] = proxyProvider;
  config.rules.unshift("RULE-SET,PROXY," + manualGroup);
}

function addOpenAIJP(config, japanGroup) {
  const openaiProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/OPENAI_JP.txt",
    path: "./providers/OPENAI_JP.txt",
    interval: 86400
  };
  config["rule-providers"]["OPENAI_JP"] = openaiProvider;
  config.rules.unshift("RULE-SET,OPENAI_JP," + japanGroup);
}

function addGoogleJP(config, japanGroup) {
  const googleProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/GOOGLE_JP.txt",
    path: "./providers/GOOGLE_JP.txt",
    interval: 86400
  };
  config["rule-providers"]["GOOGLE_JP"] = googleProvider;
  config.rules.unshift("RULE-SET,GOOGLE_JP," + japanGroup);
}

function addGoogleSupplementJP(config, japanGroup) {
  // Google/YouTube 动态规则，补充 GOOGLE_JP.txt 未列出的域名。
  const base = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/";
  config["rule-providers"]["GOOGLE_JP_SITE"] = {
    type: "http",
    behavior: "domain",
    format: "mrs",
    url: base + "google.mrs",
    path: "./providers/GOOGLE_JP_SITE.mrs",
    interval: 86400
  };
  config["rule-providers"]["GOOGLE_JP_YOUTUBE"] = {
    type: "http",
    behavior: "domain",
    format: "mrs",
    url: base + "youtube.mrs",
    path: "./providers/GOOGLE_JP_YOUTUBE.mrs",
    interval: 86400
  };
  config.rules.unshift("RULE-SET,GOOGLE_JP_SITE," + japanGroup);
  config.rules.unshift("RULE-SET,GOOGLE_JP_YOUTUBE," + japanGroup);
}

function main(config) {
  if (!config["rule-providers"]) {
    config["rule-providers"] = {};
  }
  if (!Array.isArray(config.rules)) {
    config.rules = [];
  }

  // 清除此前脚本添加的旧规则，避免刷新时重复；其他订阅规则原样保留。
  const oldNames = [
    "REJECT", "DIRECT", "PROXY", "OPENAI", "OPENAI_JP",
    "GOOGLE_JP", "GOOGLE_JP_SITE", "GOOGLE_JP_YOUTUBE"
  ];
  config.rules = config.rules.filter(rule => {
    if (typeof rule !== "string") return true;
    return !oldNames.some(name => rule.startsWith("RULE-SET," + name + ","));
  });
  delete config["rule-providers"]["OPENAI"];  // 旧版无地区后缀的残留项

  const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : [];
  const jp = groups.find(g => g.name === "🇯🇵日本节点" && g.type === "url-test")
    || groups.find(g => g.type === "url-test" && typeof g.name === "string"
      && g.name.includes("日本节点"));
  const manual = groups.find(g => g.name === "🚀节点选择" && g.type === "select")
    || groups.find(g => g.type === "select" && typeof g.name === "string"
      && g.name.includes("节点选择"));

  // 反向调用：后调用的函数匹配优先级更高。
  if (manual) {
    addProxy(config, manual.name);
  } else {
    console.warn("[my_proxy] 未找到节点选择 Selector，自定义 PROXY 分流跳过。");
  }

  addDirect(config);

  if (jp) {
    addGoogleSupplementJP(config, jp.name);
    addGoogleJP(config, jp.name);
    addOpenAIJP(config, jp.name);
  } else {
    console.warn("[my_proxy] 未找到日本 URLTest，OPENAI_JP / GOOGLE_JP 不会启用。");
  }

  addReject(config);
  return config;
}
