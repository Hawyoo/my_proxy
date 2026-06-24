function addDirect(config) {
  const directProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/DIRECT.txt",
    path: "./providers/DIRECT.txt",
    interval: 86400
  };

  if (!config["rule-providers"]) {
    config["rule-providers"] = {};
  }
  config["rule-providers"]["DIRECT"] = directProvider;

  const directRule = "RULE-SET,DIRECT,DIRECT";

  if (config.rules && Array.isArray(config.rules)) {
    config.rules.unshift(directRule);
  } else {
    config.rules = [directRule];
  }
}

function addProxy(config) {
  const proxyProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/rules/PROXY.txt",
    path: "./providers/PROXY.txt",
    interval: 86400
  };

  if (!config["rule-providers"]) {
    config["rule-providers"] = {};
  }
  config["rule-providers"]["PROXY"] = proxyProvider;

  const proxyRule = "RULE-SET,PROXY,PROXY";

  if (config.rules && Array.isArray(config.rules)) {
    config.rules.unshift(proxyRule);
  } else {
    config.rules = [proxyRule];
  }
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

  if (!config["rule-providers"]) {
    config["rule-providers"] = {};
  }
  config["rule-providers"]["REJECT"] = rejectProvider;

  const rejectRule = "RULE-SET,REJECT,REJECT";

  if (config.rules && Array.isArray(config.rules)) {
    config.rules.unshift(rejectRule);
  } else {
    config.rules = [rejectRule];
  }
}

function main(config) {
  addDirect(config);
  addProxy(config);
  addReject(config);
  return config;
}
