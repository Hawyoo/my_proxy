# 自定义 Clash 分流规则

适用于 Clash Verge Rev / Mihomo 内核。保留订阅原有策略组与规则，通过 GitHub 维护自定义 `DIRECT`、`REJECT`、`PROXY` 及地区专属规则。

## 安装 / 更新

1. 在 Clash Verge Rev 中打开「全局扩展脚本」（或当前订阅对应的脚本扩展）。
2. **将 [scripts/rules-loader.js](./scripts/rules-loader.js) 的完整内容复制进去并保存/启用**。
3. 刷新并重新应用当前订阅，确认使用 **规则（Rule）模式**，不是全局（Global）模式。
4. 在「连接」中检查 `chatgpt.com`、`api.oaistatsig.com`、`accounts.google.com`、`www.youtube.com` 等流量的规则和出站代理组：应指向日本 URLTest 组。

> **重要**：GitHub 的 JS 变更不会自动更新到你已粘贴在 Clash Verge 的本地脚本。修改脚本后要重新复制 / 应用；下列远程域名规则才会按 `interval: 86400` 进行自动更新。

## 规则优先级

| 优先级 | 规则集（GitHub） | 目的地 |
| --- | --- | --- |
| 1 | [REJECT](./rules/REJECT) | `REJECT`，自定义屏蔽（目前为占位） |
| 2 | [OPENAI_JP.txt](./rules/OPENAI_JP.txt) | 现有「🇯🇵日本节点」URLTest 组 |
| 3 | [GOOGLE_JP.txt](./rules/GOOGLE_JP.txt) | 同一个「🇯🇵日本节点」URLTest 组 |
| 4 | `GOOGLE_JP_YOUTUBE`（MetaCubeX 自动更新） | 同一个「🇯🇵日本节点」URLTest 组 |
| 5 | `GOOGLE_JP_SITE`（MetaCubeX 自动更新） | 同一个「🇯🇵日本节点」URLTest 组 |
| 6 | [DIRECT.txt](./rules/DIRECT.txt) | `DIRECT` |
| 7 | [PROXY](./rules/PROXY) | 现有「🚀节点选择」Selector 组（目前为占位） |
| 8 | 订阅原有规则 | 不改变 |

### OpenAI / ChatGPT 日区

`OPENAI_JP.txt` 包含 `openai.com`、`chatgpt.com`、`oaistatic.com`、`oaiusercontent.com`、`oaistatsig.com` 等 OpenAI 自有服务和少量官方网络文档指出的登录相关精确域名（WorkOS、Cloudflare 验证、Apple 登录相关资源）。`DOMAIN-SUFFIX,oaistatsig.com` **已经覆盖** `api.oaistatsig.com`。

Google 账号登录 ChatGPT 时，`accounts.google.com` 等由 `GOOGLE_JP` 规则分流到**同一个日本组**。若通过 Apple 身份登录，其他未列出的 Apple 登录域名仍可能根据原订阅走其他出口；可根据连接日志按需补充。

### Google 日区

`GOOGLE_JP.txt` 覆盖 Google 多国家搜索域名（含 `google.co.jp`、`google.com.hk`）、账号认证、Gmail、Workspace、Google API、CDN、Play / Android、Firebase、Gemini / DeepMind、YouTube 与相关视频域名。对 Google 国别域名使用 `DOMAIN-REGEX`，避免简单 `DOMAIN-KEYWORD,google` 过度误伤。

另外，脚本直接引用 [MetaCubeX Google](https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google.mrs) 和 [YouTube](https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs) 的持续更新的 `mrs` 规则集，以补充以后出现的服务域名。自定义 `GOOGLE_JP.txt` 与这两个外部规则集**均使用日本节点**。

> 「全部 Google」应理解为**被 Mihomo 接管且匹配到上述规则集的 Google 相关流量**，不承诺覆盖未被 VPN/TUN 接管的请求、只有目标 IP 的连接或任何未来新域名。某些 Google SDK、reCAPTCHA、Google Cloud 或 CDN 域名供其他网站使用，它们命中后也会走日本节点，这是统一 Google 出口的预期副作用。

## 命名和今后的地区扩展

地区后缀明确写进文件名，后续可以增加 `OPENAI_US.txt`、`GOOGLE_US.txt`、`OPENAI_SG.txt` 等，而不是在文件内混合多个地区出口。相应地添加新的规则提供者，并将它们绑定到对应地区策略组。**不要同时给同一域名启用互相冲突的地区规则**，否则由规则顺序决定。

## 细节与风险

- **规则（Rule）模式**下，命中 `OPENAI_JP`、`GOOGLE_JP` 的请求不会随「🚀节点选择」手动切换而改出口；**全局（Global）模式不保证**这一点。
- 「🇯🇵日本节点」必须是已有的 `url-test` 组。脚本优先识别此精确名称，找不到时寻找名称包含「日本节点」的 URLTest；找不到会发出警告并跳过地区专属规则。
- URLTest 可能在日本节点间自动切换；统一日本地区**不等于固定公网 IP**。如果希望一个固定 IP，应另建 Selector 并固定一个可靠的日本节点，但节点服务商仍可能改变 IP。
- 某些第三方身份验证 / CDN 域名为多个网站共用；命中精确域名的其他网站请求也会经由日本，并不意味着 OpenAI 会因此更改账号地区。账号地区、安全风控取决于服务端多种因素。
- 对于 `DIRECT`、`REJECT`、`PROXY`，仓库目前真实文件名分别为 `DIRECT.txt`、`REJECT`、`PROXY`。脚本按实际文件名加载，未擅自覆盖原域名清单。
- 代理规则不会绕过 ChatGPT App 的 SSL 证书安全校验。出现「非预期 SSL 证书」错误仍需排查系统 DNS、VPN、HTTPS 中间人拦截等。

参考：[Mihomo 路由规则](https://wiki.metacubex.one/config/rules/)、[Mihomo 官方配置示例](https://wiki.metacubex.one/example/conf/)、[OpenAI 网络建议](https://help.openai.com/zh-hans-cn/articles/9247338-network-recommendations-for-chatgpt-errors-on-web-and-apps)。
