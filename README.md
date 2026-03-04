# 全局拓展覆写配置
文件末尾加入以下内容：

```yaml
rule-providers:
  academic:
    type: http
    behavior: classical
    format: text
    url: "https://raw.githubusercontent.com/Hawyoo/my_proxy/main/academic.txt"
    path: ./providers/academic.txt
    interval: 86400
```