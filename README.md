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

------------

# my_proxy

本仓库用于维护代理规则（代理规则），已从“按用途拆分”重构为“按连接策略拆分”。

## 目录结构

```text
rules/
├── DIRECT.txt
├── PROXY.txt
└── REJECT.txt
scripts/
└── rules-loader.js
README.md
```

- `rules/DIRECT.txt`：当前所有实际规则（现阶段均为直连）。
- `rules/PROXY.txt`：预留（后续放代理规则）。
- `rules/REJECT.txt`：预留（后续放拦截规则）。
- `scripts/rules-loader.js`：托管在 GitHub 的完整脚本文件。

---

## 使用方式

## 方案一（推荐）：脚本托管到 GitHub，客户端通过 Raw 读取脚本

> 你的本意就是这个：  
> 把“方案二里那一大段完整 JS”放到 GitHub（`scripts/rules-loader.js`），  
> 客户端不再手动维护整段逻辑，只负责读取并执行这个 Raw 脚本。

### 步骤 1：把完整脚本放进仓库

在仓库创建文件：`scripts/rules-loader.js`  
把你本地原来那段完整脚本（也就是方案二的全部内容）粘进去并提交。

### 步骤 2：客户端只保留“加载远程脚本”

在客户端把“远程脚本地址 / 在线脚本 URL”设置为：

```text
https://raw.githubusercontent.com/Hawyoo/my_proxy/main/scripts/rules-loader.js
```

之后脚本逻辑统一在 GitHub 维护：  
- 改脚本：改 `scripts/rules-loader.js`
- 改规则：改 `rules/*.txt`
- 客户端无需重复粘贴大段 JS（只保留 Raw 地址）

---

## 方案二：本地自行写入完整脚本（手动维护）

> 该方案就是把完整脚本直接粘在本地配置中。  
> 缺点是每次改逻辑都要手动同步到所有客户端。

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
  // addProxy(config);  // PROXY.txt 有内容后启用
  // addReject(config); // REJECT.txt 有内容后启用
  return config;
}
```

---

## 维护建议

1. 规则文件固定为：
   - `rules/DIRECT.txt`
   - `rules/PROXY.txt`
   - `rules/REJECT.txt`
2. 文件名全部大写，便于统一维护。
3. 现阶段所有规则放在 `DIRECT.txt`；其余两个文件保留注释占位。
4. 优先使用方案一：逻辑与规则都在 GitHub 统一维护，客户端仅保留 Raw 地址。
