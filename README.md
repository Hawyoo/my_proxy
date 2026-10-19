# 自定义 Clash 代理规则

个人维护的 Clash Verge Rev / Mihomo 规则集：`DIRECT` / `REJECT` / `PROXY`，以及 **OpenAI 日本区** 与 **Google 日本区** 专属分流。

> **一句话用法**：把下方**完整 JavaScript** 复制到 Clash Verge 的「全局扩展脚本」，保存、应用订阅，再切换到「规则（Rule）」模式。**不要**将这些 JavaScript 粘贴到 YAML 配置或普通规则编辑器中。

## 1. 安装与更新

1. 打开 **Clash Verge Rev → 订阅（Profiles）**，找到 **全局扩展脚本（Global Script / JavaScript）**；界面路径随软件版本可能略有不同。如果你一直使用的是某个订阅自己的 JavaScript 扩展，也可以在那里使用本脚本。
2. **删除以前粘贴的旧版 `addDirect`、`addReject`、`main` 等整段代码**，全部替换成下一节这段脚本。不要同时保留两个 `main(config)`，也不要再叠加以前单独的同类规则。
3. 保存脚本并**启用**它，然后刷新 / 重新应用订阅。如果提示脚本错误，先检查是否完整复制，包括最后一个 `}`。
4. 将 Clash Verge 的模式切到 **规则（Rule）**。不要使用全局（Global）模式来检验按域名分流。
5. 进入「代理」确认现有组名为 **🇯🇵日本节点**（`URLTest`）和 **🚀节点选择**（`Selector`）；代码支持以包含「日本节点」「节点选择」的名称查找。如果你的名称完全不同，修改脚本 `main(config)` 中的匹配部分。
6. 打开 ChatGPT 和 Google，再到 **连接（Connections）** 查看请求命中的策略组。预期 `chatgpt.com`、`api.oaistatsig.com`、`accounts.google.com`、`youtube.com` 等全部经过 **🇯🇵日本节点** 组。其他网站仍按原订阅或自定义规则处理。

> 扩展脚本本身**不会随 GitHub 自动更新**：当 `scripts/rules-loader.js` 发生变化，需要重新复制到 Clash Verge。域名规则文件则由 Mihomo 按 `interval: 86400`（24 小时）自动检查更新。

## 2. 全局扩展脚本（直接整段复制）

下方内容与仓库 [scripts/rules-loader.js](./scripts/rules-loader.js) 保持一致。

```javascript
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
```

## 3. 规则文件和优先级

规则从上往下依次匹配，**最先匹配的规则生效**。由于代码使用 `unshift()` 插入规则，`main()` 按**从低到高**的优先级调用函数。

| 优先级 | 文件 / 规则集 | 出口 | 说明 |
| --- | --- | --- | --- |
| 1 | [REJECT.txt](./rules/REJECT.txt) | `REJECT` | 常见广告投放、推荐和跨站追踪（30 条） |
| 2 | [OPENAI_JP.txt](./rules/OPENAI_JP.txt) | 🇯🇵日本节点 `URLTest` | OpenAI / ChatGPT 核心服务和指定登录依赖 |
| 3 | [GOOGLE_JP.txt](./rules/GOOGLE_JP.txt) | 🇯🇵日本节点 `URLTest` | Google 搜索、账号登录、Gmail、Gemini、YouTube、Play 等 |
| 4 | MetaCubeX Google / YouTube 自动更新域名集 | 🇯🇵日本节点 `URLTest` | 补充 Google 相关域名 |
| 5 | [DIRECT.txt](./rules/DIRECT.txt) | `DIRECT` | 自定义直连（原学术 / 其他域名清单） |
| 6 | [PROXY.txt](./rules/PROXY.txt) | 🚀节点选择 `Selector` | 自定义普通代理 |
| 7 | 订阅原有规则 | 原有出口 | 原样保留 |

`REJECT.txt` 已包含 **30 条保守广告/追踪拦截规则**，`PROXY.txt` 目前仍只有一条 `.invalid` 占位域名。需要新规则时直接往文件添加行，例如 `DOMAIN-SUFFIX,example.com`，不用在每行末尾加 `DIRECT` 或 `REJECT`；由脚本决定出口。编辑 GitHub 文件后等待远程规则更新，或在 Clash Verge 中手动刷新规则集。

`OPENAI_JP.txt` 中的 `DOMAIN-SUFFIX,oaistatsig.com` **已经包含** `api.oaistatsig.com`；Google 登录所依赖的 Google 域名则通过 `GOOGLE_JP` 绑定到同一个日本代理组。个别 WorkOS、Cloudflare 验证等共享域名在 OpenAI 登录时也可能走日本；其他网站访问同一精确域名时同样会匹配。

### REJECT 广告与追踪域名说明

目前 [rules/REJECT.txt](./rules/REJECT.txt) 采用**保守清单（30 条）**，主要涵盖：

- **广告交易与实时竞价**：`adnxs.com`、`adsrvr.org`、`pubmatic.com`、`rubiconproject.com` 等。
- **广告内容推荐**：`taboola.com`、`outbrain.com`、`mgid.com` 等。
- **跨站追踪与画像**：`scorecardresearch.com`、`quantserve.com`、`demdex.net` 等。
- **广告追踪像素**：`bat.bing.com`（仅这一主机，而非整个 `bing.com`）。

`REJECT` 优先级**高于** `OPENAI_JP`、`GOOGLE_JP` 和 `DIRECT`。为了避免破坏你的日区登录与校园网权限，本清单**不包括** Google / DoubleClick 的广告统计域名、WorkOS / Cloudflare 登录校验域名，也没有把 Wiley 页面涉及的 `grapeshot.co.uk` 等第三方域名拦截。因此它是**低误伤起点**，并不是覆盖所有广告的完整拦截列表。

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

**我选了其他国家节点，OpenAI 和 Google 仍走日本吗？** 在 **规则（Rule）模式**、相关流量**已被 Mihomo 接管**且命中这些规则时，是的。「🚀节点选择」当前手动选中哪个国家，不会改变两个 JP 规则集的出口。

**日本 URLTest 是否代表永远同一个日本公网 IP？** 不是。URLTest 可以根据延迟更换日本组中的节点。它的作用是指定日本**代理组**，不是固定某个出口公网 IP。若要尽量固定出口，应另建日本 Selector 并手动选定一个服务器。

**为什么 Google 不只使用 GOOGLE_JP.txt？** Google 使用大量 CDN / 登录 / 视频域名；脚本还自动更新 [MetaCubeX Google](https://github.com/MetaCubeX/meta-rules-dat) 和 YouTube 域名集以补充遗漏。可能有第三方网站也使用同一 Google CDN、验证码等资源，它们会走日本；这并不等于你的 OpenAI 账号地区会因此改变。

**可不可以覆盖 Google / OpenAI 的绝对全部流量？** 只保证按已配置规则匹配的、进入 Mihomo 的流量。未进入 VPN/TUN 的连接、部分仅 IP 连接及未来新域名无法保证。遇到新的目标域名可追加至对应 `_JP.txt` 文件。

**我之前在 FlClash 遇到 SSL 证书异常，这些分流规则能修好吗？** 不一定。DNS / TLS 中间人拦截或 Android VPN 兼容性问题即便使用日本出口仍可能出现，不能通过关闭 App 的证书安全校验来解决。

## 6. 命名约定

地区专属规则采用 `服务_地区.txt` 命名：目前为 `OPENAI_JP.txt`、`GOOGLE_JP.txt`，今后可以再建 `OPENAI_US.txt`、`GOOGLE_SG.txt` 等，并在脚本中绑定到不同地区的策略组。**不要给同一域名同时安排互相冲突的地区规则**；若有冲突，以规则优先级决定出口。

项目的旧根目录 `academic.txt` / `other.txt` 内容已合并在 `rules/DIRECT.txt`；旧的 `rules/REJECT` / `rules/PROXY` 已统一更名为 `.txt`。请只维护表中列出的规范文件，避免旧路径残留。

参考：[Mihomo 规则文档](https://wiki.metacubex.one/config/rules/) · [OpenAI 网络连接建议](https://help.openai.com/en/articles/9247338-network-recommendations-for-chatgpt-errors-on-web-and-apps)。
