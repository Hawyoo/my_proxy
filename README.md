# 自定义 Clash 分流规则

适用于 Clash Verge Rev（Mihomo 内核）。在保留订阅原有规则和代理组的同时，加载自定义分流规则。

## 使用方式

1. 在 Clash Verge Rev 中打开「全局扩展脚本」（或对应订阅的扩展脚本）。
2. 将 [scripts/rules-loader.js](./scripts/rules-loader.js) 的**完整内容**复制进去，保存并启用。
3. 刷新 / 重新应用订阅，使用**规则（Rule）模式**。
4. 进入「连接」检查 `chatgpt.com`、`api.oaistatsig.com`：应命中 `OPENAI`，通过「🇯🇵日本节点」URLTest 组出站。

> 本项目的 JS 脚本不会因为 GitHub 上更新就自动更新客户端：脚本内容变化后，需要重新复制到 Clash Verge 并重新应用。远程规则文件按 `interval: 86400` 定期更新，也可手动刷新。

## 规则与顺序

| 优先级 | GitHub 文件 | 出口 | 说明 |
| --- | --- | --- | --- |
| 1 | [rules/REJECT](./rules/REJECT) | REJECT | 自定义拦截（目前为空白占位） |
| 2 | [rules/OPENAI.txt](./rules/OPENAI.txt) | 🇯🇵日本节点 | OpenAI 自有域名 + 少量明确的登录依赖 |
| 3 | [rules/DIRECT.txt](./rules/DIRECT.txt) | DIRECT | 自定义直连 |
| 4 | [rules/PROXY](./rules/PROXY) | 🚀节点选择 | 自定义代理（目前为空白占位） |
| 5 | 订阅原有规则 | 保留原值 | 不替换原有规则集或默认策略 |

- **日本节点**必须为现有的 `url-test` 代理组，优先按准确名称 `🇯🇵日本节点` 查找；找不到时查找其他名字包含「日本节点」的 URLTest 组。若不存在则跳过 OPENAI 专用规则并输出警告，不创建无效的代理组引用。
- **节点选择**为现有的 `select` 代理组，优先匹配 `🚀节点选择`。找不到时跳过自定义 PROXY 分流。
- `REJECT` 和 `PROXY` 文件没有 `.txt` 扩展名，脚本按仓库中真实文件名引用，避免 404。
- 自定义规则集使用 `classical` / `text` 格式，每行类似 `DOMAIN-SUFFIX,example.com`，**不在文件行尾添加策略名**；由扩展脚本绑定 DIRECT、REJECT 或代理组。

## 关于日本地区和 IP

- 在**规则（Rule）模式**且流量被 Mihomo 接管时，命中 OPENAI 规则的连接会走日本 URLTest 组，**不受普通「🚀节点选择」当前手动节点的影响**。全局（Global）模式不提供这一保证。
- URLTest 可能在不同日本节点间切换，因此不能保证始终是同一个公网 IP。要求出口长期稳定时，可以另建手动 `select` 组并锁定具体日本节点。
- `rules/OPENAI.txt` 只纳入 OpenAI 核心域名以及少量官方网络说明中列出的 WorkOS、Cloudflare 精确域名，不代理整个 Google、Apple、WorkOS 或 Cloudflare 域名。共享域名仍可能被其他网站使用；OpenAI 如何判定账号地区并不完全公开。
- `DOMAIN-SUFFIX,oaistatsig.com` 已包含 `api.oaistatsig.com`。
- 这套规则用于分流，**不能绕过 SSL 证书校验**；如 ChatGPT App 仍报告异常证书，需要继续诊断 VPN、DNS 和 HTTPS 拦截。

参考：[OpenAI 网络建议](https://help.openai.com/en/articles/9247338-network-recommendations-for-chatgpt-errors-on-web-and-apps)。
