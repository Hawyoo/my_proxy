# 自定义 Clash 代理规则

个人维护的 Clash Verge Rev / Mihomo 规则集：`DIRECT` / `REJECT` / `PROXY`。

> **一句话用法**：把下方**完整 JavaScript** 复制到 Clash Verge 的「全局扩展脚本」，保存、应用订阅，再切换到「规则（Rule）」模式。**不要**将这些 JavaScript 粘贴到 YAML 配置或普通规则编辑器中。

## 1. 安装与更新

1. 打开 **Clash Verge Rev → 订阅（Profiles）**，找到 **全局扩展脚本（Global Script / JavaScript）**；界面路径随软件版本可能略有不同。如果你一直使用的是某个订阅自己的 JavaScript 扩展，也可以在那里使用本脚本。
2. 将下一节的完整脚本粘贴到 JavaScript 扩展编辑器中，替换编辑器中的全部内容。
3. 保存脚本并**启用**它，然后刷新 / 重新应用订阅。如果提示脚本错误，先检查是否完整复制，包括最后一个 `}`。
4. 将 Clash Verge 的模式切到 **规则（Rule）**。不要使用全局（Global）模式来检验按域名分流。
5. 进入「代理」，确认存在 **🚀节点选择** 手动选择组，并在该组中选择要使用的节点。`Selector` 表示手动选择组类型，对应配置中的 `type: select`，不是需要追加到组名里的文字。脚本优先查找完整组名 `🚀节点选择`，其次查找 `节点选择`，最后查找名称包含「节点选择」的手动选择组。
6. 打开 `rutracker.net`，到 **连接（Connections）** 查看是否命中 `RULE-SET,PROXY`，并使用「🚀节点选择」组。

> 扩展脚本本身**不会随 GitHub 自动更新**：当 `scripts/rules-loader.js` 发生变化，需要重新复制到 Clash Verge。域名规则文件则由 Mihomo 按 `interval: 86400`（24 小时）自动检查更新。

## 2. 全局扩展脚本（直接整段复制）

下方内容与仓库 [scripts/rules-loader.js](./scripts/rules-loader.js) 保持一致。

```javascript
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

  addDirect(config);

  if (manual) {
    addProxy(config, manual.name);
  } else {
    console.warn("[my_proxy] 未找到 Selector 节点选择组；自定义 PROXY 规则未启用。");
  }

  addReject(config);
  return config;
}
```

## 3. 规则文件和优先级

### 代理组名称在哪里指定？

`PROXY.txt` 是域名规则清单，每行只写匹配条件，例如：

```text
DOMAIN-SUFFIX,rutracker.net
```

脚本找到现有的 `🚀节点选择` 组后，会生成 `RULE-SET,PROXY,🚀节点选择`，这条配置才指定代理组名称。因此，规则文件每行末尾不需要再写组名。以 `#` 开头的行只是说明注释，不参与匹配。

若你的组名带空格，例如 `🚀 节点选择`，脚本也能通过「节点选择」文字找到它，并使用实际完整组名。若没有找到符合条件的手动选择组，脚本会提示，自定义 PROXY 规则不会启用。

### 匹配顺序

规则从上往下依次匹配，**最先匹配的规则生效**。由于代码使用 `unshift()` 插入规则，`main()` 按**从低到高**的优先级调用函数。

| 优先级 | 文件 / 规则集 | 出口 | 说明 |
| --- | --- | --- | --- |
| 1 | [REJECT.txt](./rules/REJECT.txt) | `REJECT` | 常见广告投放、推荐和跨站追踪（30 条） |
| 2 | [PROXY.txt](./rules/PROXY.txt) | 🚀节点选择 `Selector` | 自定义普通代理 |
| 3 | [DIRECT.txt](./rules/DIRECT.txt) | `DIRECT` | 自定义直连（学术 / 其他域名清单） |
| 4 | 订阅原有规则 | 原有出口 | 未命中自定义规则时，按订阅规则处理 |

`REJECT.txt` 已包含 **30 条保守广告/追踪拦截规则**，`PROXY.txt` 已包含 `DOMAIN-SUFFIX,rutracker.net`，覆盖 `rutracker.net` 及其子域名，交给现有的「🚀节点选择」Selector。需要新规则时直接往文件添加行，例如 `DOMAIN-SUFFIX,example.com`，不用在每行末尾加 `DIRECT` 或 `REJECT`；由脚本决定出口。编辑 GitHub 文件后等待远程规则更新，或在 Clash Verge 中手动刷新规则集。

### REJECT 广告与追踪域名说明

目前 [rules/REJECT.txt](./rules/REJECT.txt) 采用**保守清单（30 条）**，主要涵盖：

- **广告交易与实时竞价**：`adnxs.com`、`adsrvr.org`、`pubmatic.com`、`rubiconproject.com` 等。
- **广告内容推荐**：`taboola.com`、`outbrain.com`、`mgid.com` 等。
- **跨站追踪与画像**：`scorecardresearch.com`、`quantserve.com`、`demdex.net` 等。
- **广告追踪像素**：`bat.bing.com`（仅这一主机，而非整个 `bing.com`）。

`REJECT` 优先级**高于** `PROXY` 和 `DIRECT`。本清单**不包括** Google / DoubleClick 的广告统计域名，也没有把 Wiley 页面涉及的 `grapeshot.co.uk` 等第三方域名拦截。因此它是**低误伤起点**，并不是覆盖所有广告的完整拦截列表。

**验证方式**：更新远程 REJECT 规则集后，在 Clash Verge「连接」页查看例如 `adnxs.com` 是否命中 `RULE-SET,REJECT`。如果某网页内容、登录或加载异常，查看被 REJECT 命中的域名；确认误拦截后，删除对应的 `REJECT.txt` 规则并重新更新规则集、关闭旧连接重试。不要为了屏蔽广告而直接加入 `googleapis.com`、`gstatic.com`、`challenges.cloudflare.com` 等广泛使用的服务域名。

## 4. 学术资源与校园网直连

想通过学校订阅访问 Wiley、Springer、Elsevier 等学术数据库时，将出版社**论文正文、PDF、机构认证所必需的域名**加入 [rules/DIRECT.txt](./rules/DIRECT.txt)；实际直连出口仍由**电脑当前网络/校园 VPN 的系统路由**决定，`DIRECT` 不会自动获得校园网身份。Wiley 官方支持校园 IP 范围识别、机构统一身份认证和学校代理入口。

**为什么已经直连 wiley.com，仍有流量走代理？** `DOMAIN-SUFFIX,wiley.com` 只匹配 `wiley.com` 及其子域名，不匹配 `wiley.scienceconnect.io` 等第三方主机。已增加 `wileyonlinelibrary.com` 和以下三个**精确主机名**，不会把整个第三方公司域名直接放行：

```text
DOMAIN-SUFFIX,wiley.com
DOMAIN-SUFFIX,wileyonlinelibrary.com
DOMAIN,wiley.scienceconnect.io
DOMAIN,wiley.met.vgwort.de
DOMAIN,wiley.grapeshot.co.uk
```

其中 `vgwort.de` 与 `grapeshot.co.uk` 主要属于统计/广告生态，并非 Wiley 学术授权的必需域名；直连这些请求会向第三方暴露当前校园出口 IP。若只关心正文和 PDF，可以从 DIRECT 中删除这些统计/广告规则，或在充分确认网站不受影响后选择拦截。

**规则更新后仍走代理怎么办？** 在 Clash Verge 手动刷新 **DIRECT 规则集**或等待其定期更新（24 小时）；检查 **规则（Rule）模式**及全局扩展脚本已启用；关闭旧的相关连接，刷新论文页面；在「连接」页面查看规则匹配是否为 `RULE-SET,DIRECT`。如果仍不能使用校园订阅，应先在校园 Wi-Fi / 校园 VPN 下检查 Wiley 是否显示机构授权，再确认系统路由确实经过学校的出口。不要仅根据浏览器能打开网页就断定已获取机构全文权限。

## 5. 常见问题

**自定义 PROXY 规则走哪个节点？** 命中 `PROXY.txt` 的流量交给现有的「🚀节点选择」Selector，使用你在该组中选择的节点。

**规则优先级如何判断？** Mihomo 从上往下匹配，先命中的规则生效。本脚本注入顺序为 `REJECT > PROXY > DIRECT > 原订阅规则`。因此同一域名同时出现在多个自定义规则文件时，优先级更高的规则生效。

**自定义规则是否覆盖所有流量？** 不会。它只处理明确列入规则文件、且已被 Mihomo 接管的域名。未命中的流量继续按订阅原有规则处理。

## 6. 命名约定

当前仓库维护的规范规则文件为 `rules/DIRECT.txt`、`rules/PROXY.txt` 和 `rules/REJECT.txt`。

参考：[Mihomo 规则文档](https://wiki.metacubex.one/config/rules/)。
