“全局扩展脚本”中加入以下内容：

```javascript
function addAcademic(config) {
  const academicProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/academic.txt",
    path: "./providers/academic.txt",
    interval: 86400
  };

  if (!config["rule-providers"]) {
    config["rule-providers"] = {};
  }
  config["rule-providers"]["academic"] = academicProvider;

  const academicRule = "RULE-SET,academic,DIRECT";

  if (config.rules && Array.isArray(config.rules)) {
    config.rules.unshift(academicRule);
  } else {
    config.rules = [academicRule];
  }
}

function addOther(config) {
  const otherProvider = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/other.txt",
    path: "./providers/other.txt",
    interval: 86400
  };

  if (!config["rule-providers"]) {
    config["rule-providers"] = {};
  }
  config["rule-providers"]["other"] = otherProvider;

  const otherRule = "RULE-SET,other,DIRECT";

  if (config.rules && Array.isArray(config.rules)) {
    config.rules.unshift(otherRule);
  } else {
    config.rules = [otherRule];
  }
}

function main(config) {
  addAcademic(config);
  addOther(config);
  return config;
}
```
