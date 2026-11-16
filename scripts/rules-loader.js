// Clash Verge Rev / Mihomo 全局扩展脚本
// 直接复制本文件全部内容到 Clash Verge 的 JavaScript 扩展脚本。
//
// 规则最终优先级：
// REJECT > PROXY > DIRECT > 原订阅规则
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

function main(config) {
  if (!config["rule-providers"]) {
    config["rule-providers"] = {};
  }
  if (!Array.isArray(config.rules)) {
    config.rules = [];
  }

  // 清除本脚本注入的规则，避免重复添加。
  const managedNames = ["REJECT", "DIRECT", "PROXY"];
  config.rules = config.rules.filter(rule => {
    if (typeof rule !== "string") return true;
    return !managedNames.some(name => rule.startsWith("RULE-SET," + name + ","));
  });

  const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : [];
  const manual = groups.find(g => g.name === "🚀节点选择" && g.type === "select")
    || groups.find(g => g.name === "节点选择" && g.type === "select")
    || groups.find(g => g.type === "select"
      && typeof g.name === "string" && g.name.includes("节点选择"));

  // 添加自定义直连、代理和拦截规则。
  addDirect(config);

  if (manual) {
    addProxy(config, manual.name);
  } else {
    console.warn("[my_proxy] 未找到 Selector 节点选择组；自定义 PROXY 规则未启用。");
  }

  addReject(config);
  return config;
}
