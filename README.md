# 全局扩展脚本
文件末尾加入以下内容：

```javascript
function main(config) {
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

  return config;
}
```