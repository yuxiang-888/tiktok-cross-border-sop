# 跨境电商 AI SOP 工作台

把公开仓库中的七个 Agent、方法论文档、输入模板、Prompt 和案例整理为可搜索的中文操作手册，并增加面向美国市场的 TikTok Shop 执行专栏。

线上工作台：<https://cross-border-sop-toolkit.yux49288.chatgpt.site>
项目仓库：<https://github.com/yuxiang-888/tiktok-cross-border-sop>

## 本地运行

```bash
npm install
npm run dev
```

`public/library/catalog.json` is generated from the Markdown/YAML/text files by `npm run build` and is intentionally excluded from source control.

生产静态文件：

```bash
npm run build
```

`scripts/build-catalog.mjs` 会从 `public/library/` 生成全文搜索索引，Vite 再打包至 `dist/`。

## 内容来源

- 上游：<https://github.com/heqiangdiao-wq/AI-Cross-Border-Ecommerce-Agent-Toolkit>
- 上游仓库标注 MIT License；原始许可证随站点源文件保留。
- `public/library/` 收录上游维护的 Markdown、YAML 和文本资料，以及 `TikTokShopUS/` 下带官方来源链接和核验日期的美国站操作资料。
- 上游 README 指明的未删改内部 PDF 未下载、未打包、未提供链接。

阅读页会按文档来源跳转到上游或本项目 GitHub。美国 TikTok Shop 条款和政策是 2026-10-26 核验的资料快照，不是实时政策；Seller Center 的当前要求优先。

## 重要范围说明

美国 TikTok Shop 的现行卖家条款注明适用范围为美国居民/实体，以及面向美国买家的日本跨境卖家。若经营主体在中国、且没有已确认的合格入驻路径，应先向 TikTok Shop Seller Center 核实资格，不要先备货或通过借用身份、虚假地址等方式绕过审核。本工作台不是法律或税务意见。

本站为静态资料与人工执行清单，不连接 TikTok 账号，不读取店铺数据，也不会自动发布视频、创建达人合作或处理订单。
