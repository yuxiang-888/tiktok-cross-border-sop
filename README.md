# yuxiang-888 项目集

本仓库将两个独立项目放在一个入口下，方便浏览和查找。它们各自维护、各自运行，不共享代码、用户数据或业务结果。

## 项目导航

| 项目 | 内容 | 入口 |
| --- | --- | --- |
| TikTok Shop 跨境运营 SOP 工作台 | 美国站运营流程、SOP 文档、单品任务工作台 | [在线工作台](https://cross-border-sop-toolkit.yux49288.chatgpt.site) · [本仓库根目录](./) |
| 淘宝女装 AI 智能剪辑 Agent | 直播视频分析、剪辑规划、渲染与质检 | [项目目录](./projects/ai-video-editor/) · [项目说明](./projects/ai-video-editor/README.md) |

## 如何查看与运行

- TikTok SOP 项目位于仓库根目录，运行及构建方法见下方说明。
- 剪辑 Agent 完整源码位于 `projects/ai-video-editor/`；请进入该目录并按其 README 安装依赖、运行测试。
- Cloudflare 上的在线工作台继续由 Sites 独立发布；这次仓库整理不改变线上部署。

## 来源与历史

剪辑 Agent 子目录是从 [原 Ai- 仓库](https://github.com/yuxiang-888/Ai-) 的 `main` 分支快照整理而来（导入时提交：`70069131639c5f720e780f29c17382c14fe37d09`）。原来的两个 GitHub 仓库都保留，没有删除；剪辑项目的完整提交历史仍在原 Ai- 仓库中。本仓库用于集中查看，不表示两个产品已打通。

---

## TikTok Shop 跨境运营 SOP 工作台

把公开仓库中的七个 Agent、方法论文档、输入模板、Prompt 和案例整理为可搜索的中文操作手册，并增加面向美国市场的 TikTok Shop 执行专栏。

另提供“单品运营工作台”：八阶段 SOP 自查、浏览器本地保存的商品事实卡、按手动录入成本估算每单贡献，以及仅依赖用户事实生成的固定结构脚本草稿。它不连接 TikTok 账号或 AI 服务，不验证平台资格/审核，不会自动发布。

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

本站为静态资料与人工执行清单。工作台任务、商品事实、成本与脚本草稿存放在当前浏览器，可导出或导入 JSON 备份；备份未加密，请妥善保管。不要录入平台密码、税号、顾客个人信息或供应商机密。站点不连接 TikTok 账号、不读取店铺数据、不调用 AI API，也不会自动发布视频、创建达人合作或处理订单。计算只是按用户输入金额估算每单贡献，不是净利润、税务或投资建议。
