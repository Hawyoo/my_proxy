# 自定义Clash代理规则

---

## 使用方式

“全局扩展脚本”中加入以下内容：

```javascript
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
  addReject(config);
  return config;
}
```
