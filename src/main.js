import DOMPurify from "dompurify";
import { marked } from "marked";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "./styles.css";

const UPSTREAM_REPOSITORY = "https://github.com/heqiangdiao-wq/AI-Cross-Border-Ecommerce-Agent-Toolkit";
const PROJECT_REPOSITORY = "https://github.com/yuxiang-888/tiktok-cross-border-sop";
const AGENTS = [
  { id: "01", folder: "01_Market_Research_Agent", en: "MARKET RESEARCH", title: "市场研究", job: "看清市场容量、集中度、价格带与配置机会。", cluster: "分析决策", output: "市场分析结论" },
  { id: "02", folder: "02_Product_Strategy_Agent", en: "PRODUCT STRATEGY", title: "产品策略", job: "把机会收敛成定位、主卖点、SKU 与定价。", cluster: "分析决策", output: "产品需求表" },
  { id: "03", folder: "03_Listing_Creative_Agent", en: "LISTING CREATIVE", title: "商品内容", job: "把关键词和真实参数写成可验证的商品表达。", cluster: "内容生产", output: "标题与详情页" },
  { id: "04", folder: "04_Product_Image_Agent", en: "PRODUCT IMAGE", title: "商品图片", job: "规划主图与九宫格，逐张检查平台规范。", cluster: "内容生产", output: "九图规划与 Prompt" },
  { id: "05", folder: "05_Product_Video_Agent", en: "PRODUCT VIDEO", title: "商品视频", job: "从产品 Brief 生成脚本、分镜、配音与字幕方案。", cluster: "内容生产", output: "视频脚本与分镜" },
  { id: "06", folder: "06_Advertising_Optimization_Agent", en: "AD OPTIMIZATION", title: "广告优化", job: "按漏斗定位问题，用盈亏线约束预算动作。", cluster: "运营复盘", output: "分级行动计划" },
  { id: "07", folder: "07_Review_Analysis_Agent", en: "REVIEW ANALYSIS", title: "评论分析", job: "归因买家反馈，把可修复问题回流到内容。", cluster: "运营复盘", output: "评论洞察与修复建议" },
];
const CATEGORIES = [
  { id: "all", title: "全部资料", subtitle: "ALL FIELD NOTES" },
  { id: "docs", title: "方法与规范", subtitle: "METHOD / POLICY" },
  { id: "agents", title: "七个 Agent", subtitle: "OPERATING ROUTE" },
  { id: "templates", title: "通用模板", subtitle: "READY TO FILL" },
  { id: "examples", title: "案例复盘", subtitle: "FIELD EXAMPLES" },
  { id: "tiktok-us", title: "美国 TikTok Shop", subtitle: "US SHOP PLAYBOOK" },
];
const TIKTOK_STOPS = [
  ["00", "核验主体资格", "入驻 GO / STOP", "TikTokShopUS/00_US_Eligibility.md"],
  ["01", "SKU 合规与商品页", "事实表 + Listing QA", "TikTokShopUS/01_Product_Eligibility_and_Listing.md"],
  ["02", "单位经济与报价", "贡献利润表", "TikTokShopUS/02_Offer_Unit_Economics.md"],
  ["03", "短视频生产", "原创内容 + 发布前 QA", "TikTokShopUS/03_Short_Video_Workflow.md"],
  ["04", "达人合作", "合作 Brief + 披露", "TikTokShopUS/04_Affiliate_Creator_Operations.md"],
  ["05", "LIVE 运营", "Run of show + 场控", "TikTokShopUS/05_LIVE_Operations_Runbook.md"],
  ["06", "履约与售后", "订单/异常/退款队列", "TikTokShopUS/06_Fulfillment_and_Customer_Service.md"],
  ["07", "数据复盘", "每周实验记录", "TikTokShopUS/07_Weekly_Data_Review.md"],
];
const STUDIO_STORAGE_KEY = "cross-border-sop-tiktok-studio-v1";
const WORKFLOW_STAGES = [
  { title: "核验主体资格", summary: "先核对当前美国站入驻路径。未确认前不要备货、寄样或投广告。", outcome: "一项有来源、有日期的资格判断", tasks: ["已打开当前 Seller Terms 并记录复核日期", "已在 Seller Center 对照申请主体与可用入驻路径"] },
  { title: "SKU 与商品页", summary: "先整理商品事实与证据，再按当前后台要求核对类目、限制和商品页字段。", outcome: "证据可追溯的商品事实表与 Listing 检查", tasks: ["商品参数/材质/尺寸有供应商或检测资料来源", "已核对商品类目与限制要求", "Listing 的价格、图片、详情和实物一致", "功效、认证、比较等表达均有证据或已删除"] },
  { title: "单位经济", summary: "把每单真实收入与变动成本填全，先看不含固定成本与税费的贡献估算。", outcome: "每单贡献估算和广告保本上限", tasks: ["成交收入与每项单件成本都有依据", "促销、达人佣金、退款预留已纳入测算", "已确认亏损阈值与预算停止条件"] },
  { title: "短视频内容", summary: "先用真实商品信息写原创草稿，再由真人核对画面、披露与当前内容规则。", outcome: "经过人工复核的原创视频脚本与发布前检查", tasks: ["脚本卖点能回到商品证据，未增加效果承诺", "素材为原创/已获授权，音乐与素材可用于目标市场", "合作/广告关系按当前平台要求清楚披露", "发布前在 Seller Center 核对商品卡、价格与库存"] },
  { title: "达人合作", summary: "确认合作条件、样品、内容授权、费用和披露要求，再开始沟通。", outcome: "可追溯的合作 Brief 与结算边界", tasks: ["已检查后台当前达人/联盟功能与资格", "佣金、样品、内容授权和结算口径已书面确认", "达人内容披露与商品事实已复核"] },
  { title: "LIVE 直播", summary: "先用小场次演练产品讲解、场控和异常预案，复盘后再扩大。", outcome: "Run of show、主持词和异常处理预案", tasks: ["主播已核对产品事实与禁用表述", "商品卡、库存、价格和直播设备已演练", "退货/投诉/断货等异常有责任人与处置动作"] },
  { title: "履约与售后", summary: "按实际承诺设计发货、追踪、异常升级和退款处理流程。", outcome: "可执行的订单例外与售后处理队列", tasks: ["物流承诺和实际仓配能力匹配", "订单、追踪、延误及取消异常有人负责", "退货、退款、客服口径符合 Seller Center 当前规则", "不在表格或脚本中保存顾客个人信息"] },
  { title: "每周数据复盘", summary: "用同口径、可追溯的数据比较一次变量，记录下一周负责人和判断依据。", outcome: "每周实验记录与下一步动作", tasks: ["记录时间窗口、数据来源和样本限制", "按曝光/点击/转化/退款等漏斗定位单一主要问题", "写清本周只调整的变量、责任人和复核日期"] },
];
const BRIEF_FIELDS = ["productName", "category", "audience", "useCase", "verifiedFeature", "evidenceSource", "avoidClaims"];
const ECONOMY_FIELDS = ["revenue", "productCost", "platformFees", "fulfillment", "creatorCommission", "returnReserve", "adCost"];
const ECONOMY_LABELS = { revenue: "折扣后商品收入", productCost: "产品成本", platformFees: "平台费用", fulfillment: "物流/履约成本", creatorCommission: "达人佣金", returnReserve: "退款/退货预留", adCost: "广告费" };
const makeBlankStudio = () => ({ schemaVersion: 1, revision: 0, activeStage: "stage-00", eligibility: "unverified", tasks: {}, brief: Object.fromEntries(BRIEF_FIELDS.map((field) => [field, ""])), economics: Object.fromEntries(ECONOMY_FIELDS.map((field) => [field, ""])), economicsCalculated: false, scripts: null });

function normalizeStudio(raw) {
  const blank = makeBlankStudio();
  if (!raw || raw.schemaVersion !== 1 || typeof raw !== "object") throw new Error("版本不受支持");
  const clean = { ...blank, revision: Number.isSafeInteger(raw.revision) && raw.revision >= 0 ? raw.revision : 0 };
  clean.activeStage = WORKFLOW_STAGES[Number(String(raw.activeStage || "stage-00").slice(-2))] ? raw.activeStage : "stage-00";
  clean.eligibility = ["unverified", "confirmed", "stop"].includes(raw.eligibility) ? raw.eligibility : "unverified";
  clean.tasks = {};
  WORKFLOW_STAGES.forEach((stage, index) => stage.tasks.forEach((_, taskIndex) => {
    const key = `stage-${String(index).padStart(2, "0")}:${taskIndex}`;
    clean.tasks[key] = raw.tasks?.[key] === true;
  }));
  for (const field of BRIEF_FIELDS) clean.brief[field] = typeof raw.brief?.[field] === "string" ? raw.brief[field].slice(0, 5000) : "";
  for (const field of ECONOMY_FIELDS) clean.economics[field] = typeof raw.economics?.[field] === "string" ? raw.economics[field].slice(0, 32) : "";
  clean.economicsCalculated = raw.economicsCalculated === true;
  clean.scripts = Array.isArray(raw.scripts) && raw.scripts.length === 3 && raw.scripts.every((item) => typeof item === "string") ? raw.scripts.map((item) => item.slice(0, 4000)) : null;
  return clean;
}

function readStudio() {
  try {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    return { data: raw ? normalizeStudio(JSON.parse(raw)) : makeBlankStudio(), mode: "local", message: "" };
  } catch (error) {
    return { data: makeBlankStudio(), mode: "blocked", message: error instanceof SyntaxError ? "保存数据无法读取；为避免覆盖，暂未自动保存。可先导出当前页数据或清空本地数据。" : "浏览器阻止了本地存储；当前页可继续使用，但刷新后可能丢失。" };
  }
}

const loadedStudio = readStudio();
const state = { catalog: [], loaded: false, view: "home", category: "all", agent: "", query: "", selected: "", studio: loadedStudio.data, studioMode: loadedStudio.mode, studioMessage: loadedStudio.message, studioConflict: false, studioConfirmClear: false, studioConfirmImport: false, studioPendingImport: null };
const app = document.querySelector("#app");
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const basename = (path) => path.split("/").at(-1) ?? path;
const titleFrom = (doc) => {
  const heading = doc.content.match(/^#{1,2}\s+(.+)$/m)?.[1];
  return (heading || basename(doc.path).replace(/\.(md|txt|ya?ml)$/i, "").replaceAll("_", " ")).replace(/[`*_]/g, "").trim();
};
const categoryFor = (path) => path.startsWith("TikTokShopUS/") ? "tiktok-us" : path.startsWith("docs/") ? "docs" : path.startsWith("Agents/") ? "agents" : path.startsWith("Templates/") ? "templates" : path.startsWith("Examples/") ? "examples" : "all";
const repositoryFor = (path) => path.startsWith("TikTokShopUS/") ? PROJECT_REPOSITORY : UPSTREAM_REPOSITORY;
const agentFor = (path) => AGENTS.find((agent) => path.startsWith(`Agents/${agent.folder}/`));
const typeFor = (path) => path.includes("/prompts/") ? "PROMPT" : path.includes("/templates/") ? "TEMPLATE" : path.includes("/examples/") || path.startsWith("Examples/") ? "CASE FILE" : path.includes("/references/") || path.startsWith("docs/") ? "REFERENCE" : path.endsWith("SKILL.md") ? "AGENT SKILL" : "FIELD NOTE";
const metadataFor = (doc) => {
  const agent = agentFor(doc.path);
  const firstParagraph = doc.content.replace(/^---[\s\S]*?---\s*/m, "").split(/\n\s*\n/).find((part) => part.trim() && !/^\s*(#|\||>|```)/.test(part));
  return { title: titleFrom(doc), category: categoryFor(doc.path), agent, type: typeFor(doc.path), summary: (firstParagraph || "打开查看完整说明。").replace(/[*_`>#]/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1").trim().slice(0, 150) };
};

let studioSaveTimer;
function studioStatusMessage() {
  if (state.studioConflict) return "另一个标签页更新了本地工作台；为避免覆盖，两页都已暂停自动保存。先导出要保留的内容，再重新载入。";
  if (state.studioMode !== "local") return state.studioMessage || "此页数据尚未保存在浏览器；导出备份后再离开。";
  return "仅保存在此浏览器，不会同步到 GitHub 或 TikTok。";
}

function scheduleStudioSave() {
  if (state.studioMode !== "local" || state.studioConflict) return;
  clearTimeout(studioSaveTimer);
  updateStudioStatus("正在保存到此浏览器…");
  studioSaveTimer = setTimeout(saveStudioNow, 350);
}

function saveStudioNow() {
  if (state.studioMode !== "local" || state.studioConflict) return;
  try {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    const diskRevision = raw ? normalizeStudio(JSON.parse(raw)).revision : 0;
    if (diskRevision !== state.studio.revision) {
      state.studioConflict = true;
      updateStudioStatus();
      return;
    }
    state.studio.revision += 1;
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(state.studio));
    updateStudioStatus(`已保存在此浏览器 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
  } catch {
    state.studioMode = "blocked";
    state.studioMessage = "保存失败：当前内容仍在页面内存中。请先导出 JSON 备份。";
    updateStudioStatus();
  }
}

function updateStudioStatus(customMessage = "") {
  const status = document.querySelector("#studio-save-state");
  if (status) status.textContent = customMessage || studioStatusMessage();
}

function stageComplete(index) {
  const stageId = `stage-${String(index).padStart(2, "0")}`;
  const checks = WORKFLOW_STAGES[index].tasks.every((_, taskIndex) => state.studio.tasks[`${stageId}:${taskIndex}`]);
  return checks && (index !== 0 || state.studio.eligibility === "confirmed");
}

function stageProgress() {
  return WORKFLOW_STAGES.reduce((sum, stage, index) => sum + stage.tasks.filter((_, taskIndex) => state.studio.tasks[`stage-${String(index).padStart(2, "0")}:${taskIndex}`]).length, 0);
}

function docsInCategory() {
  let docs = state.catalog.filter((doc) => state.category === "all" || doc.category === state.category);
  if (state.agent) docs = docs.filter((doc) => doc.agent?.id === state.agent);
  const query = state.query.trim().toLocaleLowerCase("zh-CN");
  if (query) docs = docs.filter((doc) => `${doc.title} ${doc.path} ${doc.content}`.toLocaleLowerCase("zh-CN").includes(query));
  return docs;
}

function header() {
  return `<header class="topbar"><a class="brand" href="#home" data-route="home" aria-label="SOP Fieldguide 首页"><span class="brand-mark">CP</span><span><b>跨境运营</b><small>FIELDGUIDE / SOP DESK</small></span></a><nav class="topnav" aria-label="主导航"><button data-route="home" class="nav-link ${state.view === "home" ? "is-active" : ""}">路线总览</button><a href="#studio" data-route="studio" class="nav-link ${state.view === "studio" ? "is-active" : ""}" ${state.view === "studio" ? 'aria-current="page"' : ""}>TikTok 实操台</a><button data-category="tiktok-us" class="nav-link ${state.category === "tiktok-us" && state.view === "library" ? "is-active" : ""}">TikTok Shop US</button><button data-route="library" class="nav-link ${state.view === "library" ? "is-active" : ""}">资料索引 <span>${state.catalog.length || "—"}</span></button><a class="nav-link source-link" href="${PROJECT_REPOSITORY}" target="_blank" rel="noreferrer">我的 GitHub ↗</a></nav><div class="top-search"><label class="sr-only" for="global-search">搜索 SOP、Prompt、模板</label><span class="search-icon" aria-hidden="true">⌕</span><input id="global-search" type="text" value="${escapeHtml(state.query)}" placeholder="搜 SOP、Prompt、模板" autocomplete="off" /><button class="search-clear ${state.query ? "" : "is-hidden"}" aria-label="清除搜索" data-clear-search>×</button><span class="search-key">↵</span><div id="search-suggestions" class="suggestions" hidden></div></div></header>`;
}

function routeStop(agent, index) {
  return `<a class="route-stop stop-${agent.id}" href="#agents" data-agent="${agent.id}" aria-label="打开 Agent ${agent.id}：${agent.title}"><span class="stop-no">${agent.id}</span><span class="stop-pin" aria-hidden="true"></span><span class="stop-label">${agent.title}</span><span class="stop-output">${agent.output}</span></a>`;
}

function tiktokRouteStop(stop) {
  return `<a class="tiktok-stop" href="#doc=${encodeURIComponent(stop[3])}" data-doc="${stop[3]}"><span>${stop[0]}</span><strong>${stop[1]}</strong><small>${stop[2]}</small><i>打开 SOP ↗</i></a>`;
}

function homePage() {
  return `<main>
    <section class="hero" id="home">
      <div class="hero-grid"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> FIELDGUIDE <i>·</i> V0.3 <i>·</i> 7 AGENT SYSTEM</div><h1>把跨境运营，<br /><em>做成可复用的工作流。</em></h1><p class="hero-lede">从市场判断到上架素材，再到广告与评论复盘。把经验拆成可执行的 Prompt、输入模板和验证清单。</p><div class="hero-actions"><a class="button button-signal" href="#studio" data-route="studio">开始 TikTok 单品工作台 <span>↗</span></a><a class="text-button" href="#library" data-route="library">进入 SOP 索引 ↗</a><button class="text-button" data-scroll="route">沿路线浏览 <span>↓</span></button></div><div class="hero-stamp"><span>OPEN SOURCE</span><span>MIT LICENSE</span><span>CHINA → GLOBAL</span></div></div><div class="dispatch-board" aria-label="运营路线卡片"><div class="board-head"><span>OPERATING ROUTE</span><span>01 — 07</span></div><div class="board-track">${AGENTS.map((agent, index) => `<div class="board-row"><b>${agent.id}</b><span class="board-line"></span><strong>${agent.title}</strong><small>${agent.cluster}</small>${index === 6 ? "<span class=\"loop-back\">↶ 回流 03 / 04</span>" : ""}</div>`).join("")}</div><div class="board-foot"><span>输入 → 判断 → 产出 → 复盘</span><span>ROUTE CLOSED</span></div><span class="board-corner" aria-hidden="true">↗</span></div></div>
      <div class="hero-bottom"><span>7 个可复用 Agent</span><span>Prompt + 输入模板 + 真实案例</span><span>合规规则贯穿全链路</span><span>← 从判断开始，闭环到复测</span></div>
    </section>
    <div class="safety-strip"><span class="safety-mark">!</span><p><b>先核合规，再谈增长。</b> 公开资料只收录仓库维护的合规路径。原仓说明中的未删改内部 PDF 不在本站提供；平台规则和费率请以官方后台当前要求为准。</p><button data-doc="docs/03_Compliance_Guard.md">查看合规守卫 ↗</button></div>
    <section class="tiktok-route-section page-width" id="tiktok-us"><div class="section-heading"><div><p class="eyebrow ink-eyebrow">UNITED STATES · TIKTOK SHOP <span>POLICY CHECKED 2026-10-26</span></p><h2>美国站执行路线：先准入，再经营</h2></div><div class="tiktok-heading-actions"><a class="button button-dark" href="#studio" data-route="studio">打开单品运营工作台 ↗</a><a class="text-button" href="${PROJECT_REPOSITORY}" target="_blank" rel="noreferrer">项目 GitHub ↗</a></div></div><div class="eligibility-gate"><span class="gate-mark">GATE 00</span><p><b>先在官方 Seller Center 确认法律主体和入驻路径。</b> 当前美国卖家条款适用范围列出美国居民/美国实体，以及面向美国买家的日本跨境卖家；中国境内主体不要默认具备资格。若不确定，先 STOP，不备货、不寄样、不买广告；禁止借身份、虚假地址或绕审。</p><a href="https://seller-us.tiktok.com/university/essay?knowledge_id=1331308753078058" target="_blank" rel="noreferrer">核对官方 Seller Terms ↗</a><button data-doc="TikTokShopUS/00_US_Eligibility.md">打开准入检查表</button></div><div class="tiktok-route-grid">${TIKTOK_STOPS.map(tiktokRouteStop).join("")}</div><p class="tiktok-route-note">工作台只在当前浏览器保存人工执行数据，不连接 TikTok 账号、读取后台或自动发布。政策是日期快照，Seller Center 当前提示优先。</p></section>
    <section class="route-section page-width" id="route"><div class="section-heading"><div><p class="eyebrow ink-eyebrow">THE OPERATING ROUTE <span>01 / 07</span></p><h2>一条从选品到复盘的航线</h2></div><p>前置判断交给数据，创意环节交给 Agent，复盘结论再回到内容。</p></div><div class="route-clusters"><span>分析决策</span><i></i><span>内容生产</span><i></i><span>运营复盘</span></div><div class="route-map">${AGENTS.map(routeStop).join("")}</div><div class="loop-note"><span>↶</span><b>闭环回流</b><span>广告与评论结论 → 修正 Listing / 主图 → 复测</span></div></section>
    <section class="start-section"><div class="page-width"><div class="section-heading"><div><p class="eyebrow ink-eyebrow">HOW TO START <span>4 STEPS</span></p><h2>拿一个产品，跑完整条链路</h2></div><button class="text-button" data-category="templates">先看通用模板 ↗</button></div><div class="start-grid"><article><span class="step-mark">A</span><h3>准备真实输入</h3><p>从输入模板开始，整理成本、参数、市场数据与买家反馈。缺数据就标为未知。</p><small>INPUT CONTRACT</small></article><article><span class="step-mark">B</span><h3>按顺序运行</h3><p>把上一步的交付物交给下一 Agent。市场数据先由脚本计算，再交给模型解读。</p><small>HANDOFF</small></article><article><span class="step-mark">C</span><h3>核对再发布</h3><p>用自检清单核对参数来源、平台字段和合规表达，所有结论都能回到输入依据。</p><small>CHECK BEFORE SHIP</small></article><article><span class="step-mark">D</span><h3>用反馈迭代</h3><p>广告和评论只回改对应症状，保留其余有效内容，让复测结果可归因。</p><small>MEASURE & ITERATE</small></article></div></div></section>
    <section class="library-preview page-width"><div class="section-heading"><div><p class="eyebrow ink-eyebrow">THE FIELD LIBRARY <span>${state.catalog.length || "…"} FILES</span></p><h2>每份资料，都能回到来源</h2></div><a class="button button-dark" href="#library" data-route="library">打开完整资料库 <span>↗</span></a></div><div class="library-shelf">${CATEGORIES.slice(1).map((category, index) => `<a class="shelf-card shelf-${index}" href="#${category.id}" data-category="${category.id}"><span>${String(index + 1).padStart(2, "0")}</span><small>${category.subtitle}</small><strong>${category.title}</strong><i>查看资料 ↗</i></a>`).join("")}</div><p class="library-note">七个通用 Agent · 方法与模板 · 美国 TikTok Shop 的准入、商品、内容、达人、LIVE、履约和复盘流程</p></section>
    <section class="source-note"><div class="page-width source-note-inner"><div><p class="eyebrow">SOURCE & LICENSE</p><h2>每份资料，<br />都能回到真实来源。</h2></div><div><p>通用资料整理自 <a href="${UPSTREAM_REPOSITORY}" target="_blank" rel="noreferrer">上游 MIT 开源仓库 ↗</a>；美国 TikTok Shop 专栏由本项目维护。每份文档卡片均链接到相应仓库原文。</p><a class="source-license" href="/library/LICENSE" target="_blank">查看上游 MIT License ↗</a><small>平台字段、费率与合规要求可能变化；执行前请复核官方最新信息。</small></div></div></section>
  </main>`;
}

function libraryNav() {
  return `<aside class="library-nav"><div class="nav-section"><p class="eyebrow ink-eyebrow">BROWSE</p>${CATEGORIES.map((category) => `<a class="category-button ${state.category === category.id && !state.agent ? "is-active" : ""}" href="#${category.id}" data-category="${category.id}"><span>${category.title}</span><small>${category.subtitle}</small></a>`).join("")}</div><div class="nav-section agent-nav"><p class="eyebrow ink-eyebrow">THE 7 AGENTS</p>${AGENTS.map((agent) => `<a class="agent-nav-button ${state.agent === agent.id ? "is-active" : ""}" href="#agents" data-agent="${agent.id}"><span>${agent.id}</span><b>${agent.title}</b><small>${agent.output}</small></a>`).join("")}</div><a class="repo-card" href="${PROJECT_REPOSITORY}" target="_blank" rel="noreferrer"><span>↗</span><b>打开我的 GitHub 仓库</b><small>查看 TikTok SOP 与站点源文件</small></a><a class="repo-card upstream-card" href="${UPSTREAM_REPOSITORY}" target="_blank" rel="noreferrer"><span>↗</span><b>查看上游资料原仓</b><small>七个通用 Agent · MIT License</small></a></aside>`;
}

function docCard(doc) {
  const meta = metadataFor(doc);
  return `<a class="doc-card" href="#doc=${encodeURIComponent(doc.path)}" data-doc="${escapeHtml(doc.path)}"><span class="doc-type">${meta.type}</span><span class="doc-title">${escapeHtml(meta.title)}</span><span class="doc-path">${escapeHtml(doc.path)}</span><span class="doc-summary">${escapeHtml(meta.summary)}</span><span class="doc-open">打开资料 ↗</span></a>`;
}

function renderList() {
  const docs = docsInCategory();
  const category = CATEGORIES.find((item) => item.id === state.category)?.title ?? "全部资料";
  return `<div class="library-results"><div class="library-results-head"><div><p class="eyebrow ink-eyebrow">${state.agent ? `AGENT ${state.agent}` : CATEGORIES.find((item) => item.id === state.category)?.subtitle || "ALL FIELD NOTES"}</p><h1>${state.agent ? AGENTS.find((item) => item.id === state.agent)?.title : category}</h1></div><span class="result-count">${docs.length} 份资料</span></div>${state.query ? `<p class="query-note">“${escapeHtml(state.query)}” 的本地搜索结果</p>` : ""}${docs.length ? `<div class="doc-list">${docs.map(docCard).join("")}</div>` : `<div class="empty-state"><span>⌕</span><h2>没有找到匹配资料</h2><p>试试更短的关键词，或切换资料分类。</p><a class="text-button" href="#library" data-clear-search>清空搜索 ↗</a></div>`}</div>`;
}

function githubUrl(doc) {
  const path = encodeURI(doc.path).replaceAll("#", "%23");
  return `${repositoryFor(doc.path)}/blob/main/${path}`;
}

function renderMarkdown(doc) {
  const source = doc.content.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/, "");
  const raw = marked.parse(source, { gfm: true, breaks: false, async: false });
  const fragment = DOMPurify.sanitize(raw, { RETURN_DOM_FRAGMENT: true, ADD_ATTR: ["target"] });
  for (const link of fragment.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("#")) continue;
    if (/\.pdf(?:$|#|\?)/i.test(href)) {
      link.removeAttribute("href");
      link.setAttribute("aria-label", "原始 PDF 未随本站公开");
      link.textContent = "原始 PDF（未随本站公开）";
      link.classList.add("source-withheld");
      continue;
    }
    if (/^https?:\/\//i.test(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    } else {
      const repository = repositoryFor(doc.path);
      const resolved = new URL(href, `${repository}/blob/main/${doc.path}`);
      const kind = resolved.pathname.includes(".") ? "blob" : "tree";
      const githubPath = resolved.pathname.replace(/^\//, "");
      link.href = `${repository}/${kind}/main/${githubPath}${resolved.hash}`;
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  }
  return fragment;
}

function documentView(doc) {
  const meta = metadataFor(doc);
  const isTikTok = doc.path.startsWith("TikTokShopUS/");
  return `<article class="document-view"><div class="document-toolbar"><button class="back-link" data-back-to-results>← 返回资料索引</button><span class="document-kind">${meta.type}</span></div><div class="document-heading"><p class="eyebrow ink-eyebrow">${isTikTok ? "US TIKTOK SHOP" : meta.agent ? `AGENT ${meta.agent.id} / ${meta.agent.en}` : meta.category.toUpperCase()} <span>· SOURCE DOCUMENT</span></p><h1>${escapeHtml(meta.title)}</h1><div class="document-source"><code>${escapeHtml(doc.path)}</code><a href="${githubUrl(doc)}" target="_blank" rel="noreferrer">打开 GitHub 原文 ↗</a></div></div><div class="document-actions"><button class="button button-signal button-small" data-copy-doc>复制全文</button><button class="button button-outline button-small" data-download-doc>下载 Markdown</button><span>仅复制当前文档</span></div><div id="markdown-body" class="markdown-body"></div><div class="document-footer"><span>${isTikTok ? "PROJECT PLAYBOOK · VERIFY LIVE POLICY" : "UPSTREAM SOURCE · MIT"}</span><a href="${githubUrl(doc)}" target="_blank" rel="noreferrer">${isTikTok ? "打开项目原文 ↗" : "核对最新版本 ↗"}</a></div></article>`;
}

function libraryPage() {
  const doc = state.catalog.find((item) => item.path === state.selected);
  const content = doc ? documentView(doc) : renderList();
  return `<main class="library-page page-width"><div class="library-page-title"><div><p class="eyebrow ink-eyebrow">THE FIELD LIBRARY <span>LOCAL / SEARCHABLE</span></p><h1>运营资料索引</h1></div><p>通用 Agent 资料与美国 TikTok Shop 执行手册。<br />按需阅读，按对应仓库原文复核。</p></div><div class="library-shell">${libraryNav()}<section class="library-content" aria-live="polite">${content}</section></div></main>`;
}

function stageTasksMarkup(index) {
  const prefix = `stage-${String(index).padStart(2, "0")}`;
  return WORKFLOW_STAGES[index].tasks.map((task, taskIndex) => {
    const key = `${prefix}:${taskIndex}`;
    return `<li><input type="checkbox" id="task-${prefix}-${taskIndex}" data-stage-task="${key}" ${state.studio.tasks[key] ? "checked" : ""}><label for="task-${prefix}-${taskIndex}">${escapeHtml(task)}</label></li>`;
  }).join("");
}

function briefTextField(key, label, hint, multiline = false) {
  const value = escapeHtml(state.studio.brief[key] || "");
  const id = `brief-${key}`;
  return `<div class="studio-field ${multiline ? "studio-field-wide" : ""}"><label for="${id}">${label}</label>${multiline ? `<textarea id="${id}" class="resize-none" data-brief-field="${key}" rows="3" maxlength="5000" aria-describedby="${id}-hint">${value}</textarea>` : `<input id="${id}" type="text" data-brief-field="${key}" maxlength="5000" value="${value}" aria-describedby="${id}-hint" autocomplete="off">`}<small id="${id}-hint">${hint}</small></div>`;
}

function economicsField(key, label, required = true) {
  const id = `econ-${key}`;
  const requiredText = required ? "必填；没有这项成本时也请明确填 0。" : "可留空；留空时不估算广告后贡献。";
  return `<div class="studio-field"><label for="${id}">${label}${required ? " <i>必填</i>" : " <i>可选</i>"}</label><div class="studio-number-wrap"><span aria-hidden="true">$</span><input id="${id}" type="number" min="0" step="0.01" inputmode="decimal" data-economics-field="${key}" value="${escapeHtml(state.studio.economics[key])}" aria-describedby="${id}-hint ${id}-error"></div><small id="${id}-hint">USD / 单 · ${requiredText}</small><small id="${id}-error" class="studio-field-error" hidden></small></div>`;
}

function buildScripts() {
  const brief = state.studio.brief;
  const name = brief.productName.trim();
  const feature = brief.verifiedFeature.trim();
  const useCase = brief.useCase.trim() || "this use case";
  const evidence = brief.evidenceSource.trim();
  const avoid = brief.avoidClaims.trim();
  const sourceLine = `Fact to verify before recording: ${evidence}`;
  const avoidLine = avoid ? `Do not claim: ${avoid}` : "Do not add performance, safety, health, comparison, certification, or outcome claims that are not supported by the source.";
  return [
    `VIDEO 1 — SHOW THE PRODUCT IN USE\nHook (EN): “Looking for an option for ${useCase}? Here is ${name}.”\nShot 1: Show the real product and packaging.\nVoiceover (EN): “One detail to notice is ${feature}. Check the product card for current options and full product details.”\nShot 2: Show the feature clearly without altering or exaggerating it.\nCTA (EN): “Review the product details in the TikTok Shop product card.”\n${sourceLine}\n${avoidLine}`,
    `VIDEO 2 — ONE VERIFIED DETAIL\nHook (EN): “A closer look at ${name}.”\nShot 1: Show the item from a clear, unedited angle.\nVoiceover (EN): “The product information lists ${feature}. Here is what that detail looks like on the actual item.”\nShot 2: Demonstrate only what the camera can faithfully show.\nCTA (EN): “Check the product card for exact specifications and current price.”\n${sourceLine}\n${avoidLine}`,
    `VIDEO 3 — HELP THE VIEWER COMPARE\nHook (EN): “Comparing options for ${useCase}? Take a look at ${name}.”\nShot 1: Show the relevant product detail.\nVoiceover (EN): “The listed feature is ${feature}. Review the full specifications and decide whether it fits your needs.”\nShot 2: Show the actual dimensions, included items, or operation only if verified.\nCTA (EN): “See the current product details in the TikTok Shop product card.”\n${sourceLine}\n${avoidLine}`,
  ];
}

function scriptOutputMarkup() {
  if (!state.studio.scripts) return `<div class="studio-script-empty" data-script-output><span>03 / DRAFT</span><p>先填写商品名称、一个有证据支持的特点和证据来源，再生成三种英文脚本结构。</p></div>`;
  return `<div class="studio-script-results" data-script-output>${state.studio.scripts.map((script, index) => `<article><form data-copy-script-form="${index}" novalidate><span>VIDEO 0${index + 1} · DRAFT</span><button type="submit" class="button button-outline button-small">复制脚本</button></form><pre>${escapeHtml(script)}</pre></article>`).join("")}</div>`;
}

function stageToolMarkup(index) {
  if (index === 0) {
    const status = state.studio.eligibility;
    return `<section class="studio-tool studio-eligibility-tool"><div class="studio-tool-heading"><span>GATE 00</span><h3>你已在 Seller Center 核实到什么？</h3></div><p>这是你手动记录的判断，不是本工具验证或平台批准。若不确定，选“尚未核实”，先向官方确认；不要借主体、地址或资格继续。</p><fieldset class="eligibility-choice"><legend class="sr-only">手动记录的 Seller Center 资格状态</legend><label class="eligibility-option"><input type="radio" name="seller-eligibility" value="unverified" data-eligibility="unverified" ${status === "unverified" ? "checked" : ""}><span>尚未核实</span></label><label class="eligibility-option"><input type="radio" name="seller-eligibility" value="confirmed" data-eligibility="confirmed" ${status === "confirmed" ? "checked" : ""}><span>我已在后台核实符合</span></label><label class="eligibility-option"><input type="radio" name="seller-eligibility" value="stop" data-eligibility="stop" ${status === "stop" ? "checked" : ""}><span>不符合或有疑问，暂停</span></label></fieldset><div class="studio-tool-links"><a href="https://seller-us.tiktok.com/university/essay?knowledge_id=1331308753078058" target="_blank" rel="noreferrer">打开官方 Seller Terms ↗</a><button type="button" class="text-button" data-doc="TikTokShopUS/00_US_Eligibility.md">阅读资格 SOP ↗</button></div></section>`;
  }
  if (index === 1) {
    return `<section class="studio-tool"><div class="studio-tool-heading"><span>01 / FACT SHEET</span><h3>商品事实卡</h3></div><p>只写能用规格书、实物或检测资料核对的事实。这里不需要账号、税号、顾客或供应商机密。</p><form class="studio-form-grid" data-brief-form novalidate>${briefTextField("productName", "商品名称", "可先用内部 SKU 名称，不必填品牌机密。")}${briefTextField("category", "计划类目", "还没核对后台类目时写“待核实”。")}${briefTextField("audience", "目标受众", "具体使用人群或场景；不确定可留空。")}${briefTextField("useCase", "使用场景", "客观场景，不写未经证明的效果。")}${briefTextField("verifiedFeature", "一个证据支持的商品特点", "建议用英文短语便于英文草稿复用；中文会原样带入，不自动翻译。", true)}${briefTextField("evidenceSource", "证据来源", "例如规格书页码、检测报告编号或公开商品资料链接；勿上传敏感文件。", true)}${briefTextField("avoidClaims", "不能说/尚无证据的内容", "例如疗效、认证、比较或保证；脚本会把它列为禁用提醒。", true)}</form><div class="studio-inline-note"><b>保存方式</b><span>填写内容会自动保存在当前浏览器。脚本工具只读取这张事实卡，不连接 AI 或 TikTok。</span></div></section>`;
  }
  if (index === 2) {
    return `<section class="studio-tool"><div class="studio-tool-heading"><span>02 / PER-ORDER MODEL</span><h3>每单贡献估算</h3></div><p>把 Seller Center / 合作条款中的实际金额抄入每单 USD；这里不预设任何 TikTok 费率。</p><form class="studio-economics-form" data-economics-form novalidate><div class="studio-form-grid economics-grid">${economicsField("revenue", "折扣后商品收入")}${economicsField("productCost", "产品成本")}${economicsField("platformFees", "平台费用")}${economicsField("fulfillment", "物流与履约成本")}${economicsField("creatorCommission", "达人佣金")}${economicsField("returnReserve", "退款/退货成本预留")}${economicsField("adCost", "广告费/成交单", false)}</div><button class="button button-dark" type="submit">核对输入并计算 ↗</button><p class="studio-economics-error" data-economics-error role="alert" hidden></p></form><div class="economics-result" data-economics-result tabindex="-1" aria-live="polite">填全六项必填金额后再计算；没发生的成本也请填 0，不要把漏填误当成零成本。</div><p class="studio-caveat">仅为“每单贡献”估算：收入 − 产品成本 − 平台费 − 履约 − 达人佣金 − 退货预留 − 广告。不是净利润；未含税、固定费用、汇兑、库存资金占用等。输入口径和后台费率请自行复核。</p></section>`;
  }
  if (index === 3) {
    const ready = Boolean(state.studio.brief.productName.trim() && state.studio.brief.verifiedFeature.trim() && state.studio.brief.evidenceSource.trim());
    const reason = !state.studio.brief.productName.trim() ? "先填商品名称" : !state.studio.brief.verifiedFeature.trim() ? "再填一项有证据支持的特点" : !state.studio.brief.evidenceSource.trim() ? "补上证据来源" : "";
    return `<section class="studio-tool"><div class="studio-tool-heading"><span>03 / CONTENT DESK</span><h3>短视频脚本草稿</h3></div><p>生成三个固定结构，不会代替翻译、事实核查、素材授权或 TikTok 发布审核。中文输入会原样进入英文句子；录制前需人工翻译和复核。</p><form data-script-form novalidate><button type="submit" class="button button-dark" data-generate-scripts ${ready ? "" : "disabled"}>生成三种草稿 ↗</button>${reason ? `<small class="studio-action-hint">${reason}</small>` : ""}</form><div class="studio-script-warning"><b>发布前人工检查</b><span>核实每个卖点证据、音乐/素材授权、商业合作披露和当前商品卡信息；不得把草稿视为平台审核通过。</span></div>${scriptOutputMarkup()}</section>`;
  }
  return `<section class="studio-tool studio-reference-tool"><div class="studio-tool-heading"><span>${String(index).padStart(2, "0")} / SOP REFERENCE</span><h3>对照本阶段 SOP 执行</h3></div><p>${escapeHtml(WORKFLOW_STAGES[index].summary)}</p><div class="studio-deliverable"><span>阶段交付物</span><b>${escapeHtml(WORKFLOW_STAGES[index].outcome)}</b></div><div class="studio-inline-note"><b>遇到不确定项</b><span>先标为未知，回到官方 Seller Center 或对应合作方确认；不要用猜测的数字、资质或政策替代证据。</span></div></section>`;
}

function stageStatusLabel(index) {
  if (index === 0 && state.studio.eligibility === "stop") return "STOP / 暂停";
  if (index === 0 && state.studio.eligibility !== "confirmed") return "资格待核实";
  return stageComplete(index) ? "清单已勾完" : "待执行";
}

function studioPage() {
  const currentIndex = Math.max(0, Number(state.studio.activeStage.slice(-2)) || 0);
  const current = WORKFLOW_STAGES[currentIndex];
  const progress = stageProgress();
  const maxProgress = WORKFLOW_STAGES.reduce((total, stage) => total + stage.tasks.length, 0);
  const allDone = state.studio.eligibility === "confirmed" && WORKFLOW_STAGES.every((_, index) => stageComplete(index));
  const overviewStatus = state.studio.eligibility === "stop" ? "STOP · 暂停后续投入" : state.studio.eligibility === "confirmed" ? "由操作者标记符合 · 未经本工具验证" : "资格未核实 · 暂不备货/寄样/投放";
  return `<main class="studio-page page-width"><header class="studio-page-heading"><div><p class="eyebrow ink-eyebrow">TIKTOK SHOP US <span>OPERATOR WORKBENCH / SINGLE SKU</span></p><h1 id="studio-product-name">${escapeHtml(state.studio.brief.productName.trim() || "单品运营工作台")}</h1><p>按 SOP 一步一步准备美国 TikTok Shop 单品上市。可以阅读后续资料，但先完成主体资格核验。</p></div><div class="studio-heading-actions"><a class="text-button" href="#tiktok-us" data-route="home">← 返回路线总览</a><button class="button button-outline button-small" type="button" data-export-studio>导出 JSON 备份 ↗</button><button class="button button-outline button-small" type="button" data-import-studio>导入 JSON 备份</button><input id="studio-import-file" type="file" accept="application/json,.json" class="sr-only" aria-label="选择 TikTok 工作台 JSON 备份"><button class="text-button studio-clear-trigger" type="button" data-confirm-clear>清空本地数据</button></div></header>
    <section class="studio-data-notice" aria-label="本地数据说明"><span class="studio-data-icon">LOCAL</span><div><b>工作内容只保存在此浏览器</b><p id="studio-save-state" role="status" aria-live="polite">${escapeHtml(studioStatusMessage())}</p><small>不要填写账号密码、税号、顾客个人信息或供应商机密；GitHub 不会收到这些工作内容。导出备份是未加密的 JSON 文件。</small></div></section>
    <div class="studio-alert studio-alert-warning" id="studio-conflict-notice" role="alert" ${state.studioConflict ? "" : "hidden"}><b>检测到另一个标签页的修改</b><p>自动保存已暂停。请先导出本页想保留的数据，再刷新以加载另一个标签页保存的版本。</p><button class="button button-outline button-small" type="button" data-reload-studio>重新载入本地版本</button></div>
    ${state.studioMode !== "local" ? `<div class="studio-alert studio-alert-warning" role="alert"><b>本地保存不可用</b><p>${escapeHtml(state.studioMessage)}</p></div>` : ""}
    ${state.studioConfirmClear ? `<section class="studio-confirm-panel" aria-labelledby="clear-confirm-title"><div><p class="eyebrow ink-eyebrow">IRREVERSIBLE · LOCAL DATA</p><h2 id="clear-confirm-title">确认清空此浏览器里的工作台？</h2><p>会永久移除此浏览器保存的任务勾选、商品事实卡、成本输入和脚本草稿。若想保留，先导出 JSON。</p></div><form data-clear-confirm-form novalidate><a class="button button-outline" href="#studio" data-cancel-clear>取消，保留数据</a><button type="submit" class="button button-danger">确认清空</button></form></section>` : ""}
    ${state.studioConfirmImport && state.studioPendingImport ? `<section class="studio-confirm-panel" aria-labelledby="import-confirm-title"><div><p class="eyebrow ink-eyebrow">REPLACE · LOCAL WORKSPACE</p><h2 id="import-confirm-title">用备份替换当前本地工作台？</h2><p>备份项目：${escapeHtml(state.studioPendingImport.brief.productName || "未命名")}；会覆盖本浏览器现有的任务、事实卡、成本输入和脚本草稿。当前状态会被替换，建议先导出。</p></div><form data-import-confirm-form novalidate><a class="button button-outline" href="#studio" data-cancel-import>取消，不替换</a><button type="submit" class="button button-danger">确认替换</button></form></section>` : ""}
    <section class="studio-readiness ${state.studio.eligibility === "stop" ? "is-stop" : ""}" aria-label="资格与清单状态"><div><span class="studio-readiness-label">当前准入记录</span><b>${escapeHtml(overviewStatus)}</b></div><div class="studio-progress-wrap"><span>SOP 检查项</span><progress max="${maxProgress}" value="${progress}" aria-label="已完成的 SOP 检查项">${progress}/${maxProgress}</progress><b>${progress} / ${maxProgress}</b></div><div class="studio-final-state"><span>${allDone ? "清单已逐项勾完" : "清单尚未全部完成"}</span><small>${allDone ? "仍须由你在 Seller Center 最终复核；本工具不确认开店或发布资格。" : "完成清单不等于平台批准或商品审核通过。"}</small></div></section>
    <div class="studio-layout"><nav class="studio-stage-rail" aria-label="TikTok Shop SOP 八个阶段"><p class="eyebrow ink-eyebrow">THE SOP ROUTE <span>00 — 07</span></p>${WORKFLOW_STAGES.map((stage, index) => `<a class="studio-stage-button ${index === currentIndex ? "is-current" : ""} ${stageComplete(index) ? "is-done" : ""}" href="#studio=stage-${String(index).padStart(2, "0")}" data-studio-stage="${index}" ${index === currentIndex ? 'aria-current="step"' : ""}><span>${String(index).padStart(2, "0")}</span><b>${escapeHtml(stage.title)}</b><small>${escapeHtml(stageStatusLabel(index))}</small></a>`).join("")}<p class="studio-rail-note">每步都链接对应 SOP；勾选只记录你的自查，不是外部验证。</p></nav>
      <section class="studio-stage-panel" aria-labelledby="active-stage-title"><div class="studio-stage-header"><div><p class="eyebrow ink-eyebrow">STAGE ${String(currentIndex).padStart(2, "0")} <span>· ${String(currentIndex + 1).padStart(2, "0")} / 08</span></p><h2 id="active-stage-title">${escapeHtml(current.title)}</h2><p>${escapeHtml(current.summary)}</p></div><a class="button button-outline button-small" href="#doc=${encodeURIComponent(TIKTOK_STOPS[currentIndex][3])}" data-doc="${TIKTOK_STOPS[currentIndex][3]}">阅读本阶段完整 SOP ↗</a></div>
        <div class="studio-stage-body"><section class="studio-checklist"><div class="studio-checklist-heading"><span>SELF-CHECK · NOT PLATFORM VERIFIED</span><b>完成后勾选</b></div><ul>${stageTasksMarkup(currentIndex)}</ul><small>这些是执行记录。平台审批状态必须回 Seller Center 查看。</small></section>${stageToolMarkup(currentIndex)}</div>
        <footer class="studio-stage-footer">${currentIndex === 0 ? `<span class="button button-outline studio-disabled-nav" aria-disabled="true">← 上一阶段</span>` : `<a class="button button-outline" href="#studio=stage-${String(currentIndex - 1).padStart(2, "0")}" data-studio-prev>← 上一阶段</a>`}<span class="studio-step-caption">${String(currentIndex + 1).padStart(2, "0")} / 08 · ${escapeHtml(current.outcome)}</span>${currentIndex === WORKFLOW_STAGES.length - 1 ? `<span class="button button-dark studio-disabled-nav" aria-disabled="true">下一阶段 →</span>` : `<a class="button button-dark" href="#studio=stage-${String(currentIndex + 1).padStart(2, "0")}" data-studio-next>下一阶段 →</a>`}</footer>
      </section></div>
    <p class="studio-site-boundary">这是 SOP 执行工具，不是 TikTok 官方产品：不连接店铺账号、不读取订单或流量、不调用 AI 服务、不自动发布内容。</p>
  </main>`;
}

function render() {
  const pageTitle = state.view === "studio" ? "TikTok Shop 单品运营工作台" : state.view === "home" ? "跨境电商 SOP Fieldguide" : state.selected ? titleFrom(state.catalog.find((item) => item.path === state.selected) || { content: "", path: state.selected }) : "跨境运营资料索引";
  document.title = `${pageTitle} — 跨境电商 SOP 工作台`;
  app.innerHTML = `${header()}${state.loaded ? (state.view === "home" ? homePage() : state.view === "studio" ? studioPage() : libraryPage()) : `<main class="loading-state"><span class="route-loader"></span><p>正在装载运营资料…</p></main>`}<footer class="footer"><div class="page-width"><a class="brand footer-brand" href="#home" data-route="home"><span class="brand-mark">CP</span><span><b>跨境运营</b><small>FIELDGUIDE / SOP DESK</small></span></a><p>为真实经营判断服务。平台规则以官方信息为准。</p><a href="${PROJECT_REPOSITORY}" target="_blank" rel="noreferrer">项目 GitHub ↗</a><a href="${UPSTREAM_REPOSITORY}" target="_blank" rel="noreferrer">上游仓库 ↗</a><small>© Upstream contributors · MIT License</small></div></footer><div class="toast" role="status" aria-live="polite"></div>`;
  if (state.view === "library" && state.selected) {
    const doc = state.catalog.find((item) => item.path === state.selected);
    const body = document.querySelector("#markdown-body");
    if (doc && body) body.replaceChildren(renderMarkdown(doc));
  }
  if (state.view === "studio" && state.studio.economicsCalculated) updateEconomicsResult(true);
}

function showSuggestions(input) {
  const box = document.querySelector("#search-suggestions");
  const clear = document.querySelector("[data-clear-search]");
  if (!box) return;
  const query = input.trim().toLocaleLowerCase("zh-CN");
  clear?.classList.toggle("is-hidden", !query);
  if (!query) { box.hidden = true; box.replaceChildren(); return; }
  const matches = state.catalog.filter((doc) => `${doc.title} ${doc.path} ${doc.content}`.toLocaleLowerCase("zh-CN").includes(query)).slice(0, 5);
  const suggestions = document.createDocumentFragment();
  if (matches.length) {
    for (const doc of matches) {
      const link = document.createElement("a");
      link.href = `#doc=${encodeURIComponent(doc.path)}`;
      link.dataset.doc = doc.path;
      const title = document.createElement("span");
      title.textContent = titleFrom(doc);
      const path = document.createElement("small");
      path.textContent = doc.path;
      link.append(title, path);
      suggestions.append(link);
    }
  } else {
    const empty = document.createElement("p");
    empty.textContent = "没有匹配资料";
    suggestions.append(empty);
  }
  const all = document.createElement("a");
  all.className = "suggestion-all";
  all.href = `#search=${encodeURIComponent(state.query)}`;
  all.dataset.route = "library";
  all.textContent = "查看全部搜索结果 ↵";
  suggestions.append(all);
  box.replaceChildren(suggestions);
  box.hidden = false;
}

let toastTimer;
function announce(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function moveToStudioStage(index, focusSelector = "") {
  const boundedIndex = Math.max(0, Math.min(WORKFLOW_STAGES.length - 1, index));
  state.view = "studio";
  state.studio.activeStage = `stage-${String(boundedIndex).padStart(2, "0")}`;
  history.replaceState(null, "", `#studio=${state.studio.activeStage}`);
  scheduleStudioSave();
  render();
  document.querySelector(focusSelector || `[data-studio-stage="${boundedIndex}"]`)?.focus();
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

function exportStudio() {
  try {
    const backup = JSON.stringify({ ...state.studio, exportedAt: new Date().toISOString() }, null, 2);
    const url = URL.createObjectURL(new Blob([backup], { type: "application/json;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tiktok-shop-workbench-backup.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce("本地 JSON 备份已导出；请妥善保管");
  } catch {
    announce("无法生成备份；请尝试其他浏览器或允许文件下载");
  }
}

function updateEconomicsResult(showErrors = false) {
  const result = document.querySelector("[data-economics-result]");
  const formError = document.querySelector("[data-economics-error]");
  if (!result) return;
  const required = ECONOMY_FIELDS.filter((field) => field !== "adCost");
  const values = {};
  let invalid = false;
  const missing = [];
  for (const field of ECONOMY_FIELDS) {
    const input = document.querySelector(`[data-economics-field="${field}"]`);
    const error = document.querySelector(`#econ-${field}-error`);
    const raw = input?.value.trim() ?? "";
    const number = raw === "" ? null : Number(raw);
    let message = "";
    if (input?.validity.badInput) message = "请输入有效的数字金额。";
    else if (number !== null && (!Number.isFinite(number) || number < 0)) message = "金额必须是大于或等于 0 的有效数字。";
    else if (required.includes(field) && number === null) message = "此项必填；没有这项成本时，请明确填 0。";
    if (message) invalid = true;
    if (required.includes(field) && number === null) missing.push(ECONOMY_LABELS[field]);
    if (input) {
      input.setAttribute("aria-invalid", showErrors && Boolean(message) ? "true" : "false");
      if (error) { error.hidden = !(showErrors && message); error.textContent = message; }
    }
    values[field] = number;
  }
  if (!state.studio.economicsCalculated) {
    result.textContent = "填全六项必填金额后再计算；没发生的成本也请填 0，不要把漏填误当成零成本。";
    if (formError) formError.hidden = true;
    return;
  }
  if (invalid) {
    if (formError) { formError.hidden = false; formError.textContent = `请修正金额后再看估算。${missing.length ? ` 尚未填写：${missing.join("、")}。` : ""}`; }
    result.textContent = "当前输入未通过核对，尚未生成估算。";
    return;
  }
  if (formError) formError.hidden = true;
  const beforeAds = values.revenue - values.productCost - values.platformFees - values.fulfillment - values.creatorCommission - values.returnReserve;
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const adLine = values.adCost === null ? "未填写广告花费，因此不显示广告后贡献。" : `广告后贡献：${formatter.format(beforeAds - values.adCost)} / 单`;
  result.replaceChildren();
  const makeMetric = (label, value, negative = false) => {
    const metric = document.createElement("div");
    metric.className = `economics-metric${negative ? " is-negative" : ""}`;
    const title = document.createElement("span");
    title.textContent = label;
    const amount = document.createElement("b");
    amount.textContent = value;
    metric.append(title, amount);
    result.append(metric);
  };
  makeMetric("广告前每单贡献估算", formatter.format(beforeAds), beforeAds < 0);
  makeMetric("广告费保本上限估算", formatter.format(beforeAds), beforeAds < 0);
  const note = document.createElement("p");
  note.textContent = `${adLine}${beforeAds <= 0 ? " 当前输入下没有正向广告空间，请核对成本与收入口径。" : ""}`;
  result.append(note);
}

function refreshScriptGate() {
  const name = state.studio.brief.productName.trim();
  const feature = state.studio.brief.verifiedFeature.trim();
  const evidence = state.studio.brief.evidenceSource.trim();
  const button = document.querySelector("[data-generate-scripts]");
  const hint = document.querySelector(".studio-action-hint");
  if (!button) return;
  const ready = Boolean(name && feature && evidence);
  button.disabled = !ready;
  const reason = !name ? "先填商品名称" : !feature ? "再填一项有证据支持的特点" : !evidence ? "补上证据来源" : "";
  if (hint) { hint.textContent = reason; hint.hidden = !reason; }
  else if (reason) {
    const message = document.createElement("small");
    message.className = "studio-action-hint";
    message.textContent = reason;
    button.insertAdjacentElement("afterend", message);
  }
}

function clearStudioWorkspace() {
  try { localStorage.removeItem(STUDIO_STORAGE_KEY); state.studioMode = "local"; state.studioMessage = ""; }
  catch { state.studioMode = "blocked"; state.studioMessage = "浏览器阻止了清空操作；旧数据可能仍在本地。"; }
  state.studio = makeBlankStudio();
  state.studioConflict = false;
  state.studioConfirmClear = false;
  state.studioConfirmImport = false;
  state.studioPendingImport = null;
  state.view = "studio";
  history.replaceState(null, "", "#studio=stage-00");
  render();
  announce("本地工作台已清空");
}

function replaceStudioFromBackup() {
  if (state.studioConflict) { announce("发现另一标签页的修改；先导出并重新载入后，再选择备份文件"); return; }
  const imported = state.studioPendingImport;
  if (!imported) return;
  try {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    let revision = 0;
    try { revision = raw ? normalizeStudio(JSON.parse(raw)).revision : 0; } catch { /* Explicit replacement may recover unreadable local data. */ }
    imported.revision = revision + 1;
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(imported));
    state.studioMode = "local";
    state.studioMessage = "";
  } catch {
    state.studioMode = "blocked";
    state.studioMessage = "备份已载入当前页面，但浏览器拒绝保存；请立即导出并保持此页。";
  }
  state.studio = imported;
  state.studioConflict = false;
  state.studioConfirmImport = false;
  state.studioPendingImport = null;
  state.view = "studio";
  history.replaceState(null, "", `#studio=${state.studio.activeStage}`);
  render();
  announce("备份已替换当前工作台");
}

window.addEventListener("storage", (event) => {
  if (event.key !== STUDIO_STORAGE_KEY) return;
  clearTimeout(studioSaveTimer);
  state.studioConflict = true;
  updateStudioStatus();
  const notice = document.querySelector("#studio-conflict-notice");
  if (notice) notice.hidden = false;
});

function openDoc(path) {
  state.view = "library";
  state.selected = path;
  state.category = categoryFor(path);
  state.agent = agentFor(path)?.id ?? "";
  history.replaceState(null, "", `#doc=${encodeURIComponent(path)}`);
  render();
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

function searchRoute() {
  state.view = "library";
  state.category = "all";
  state.agent = "";
  state.selected = "";
  history.replaceState(null, "", state.query ? `#search=${encodeURIComponent(state.query)}` : "#library");
  render();
}

app.addEventListener("input", (event) => {
  if (event.target.id === "global-search") {
    state.query = event.target.value;
    showSuggestions(state.query);
    return;
  }
  const briefField = event.target.dataset.briefField;
  if (briefField && BRIEF_FIELDS.includes(briefField)) {
    state.studio.brief[briefField] = event.target.value;
    state.studio.scripts = null;
    if (briefField === "productName") { const title = document.querySelector("#studio-product-name"); if (title) title.textContent = event.target.value.trim() || "单品运营工作台"; }
    const oldOutput = document.querySelector("[data-script-output]");
    if (oldOutput && state.view === "studio" && Number(state.studio.activeStage.slice(-2)) === 3 && oldOutput.classList.contains("studio-script-results")) {
      oldOutput.className = "studio-script-empty";
      oldOutput.replaceChildren();
      const draftLabel = document.createElement("span");
      draftLabel.textContent = "03 / DRAFT";
      const updateNote = document.createElement("p");
      updateNote.textContent = "商品事实已更新；为避免使用旧信息，请重新生成草稿。";
      oldOutput.append(draftLabel, updateNote);
    }
    refreshScriptGate();
    if (!event.isComposing) scheduleStudioSave();
    return;
  }
  const economicsField = event.target.dataset.economicsField;
  if (economicsField && ECONOMY_FIELDS.includes(economicsField)) {
    state.studio.economics[economicsField] = event.target.value;
    state.studio.economicsCalculated = false;
    scheduleStudioSave();
    updateEconomicsResult(false);
  }
});

app.addEventListener("compositionend", (event) => {
  if (event.target.dataset.briefField) scheduleStudioSave();
});

app.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.matches("[data-clear-confirm-form]")) { event.preventDefault(); clearStudioWorkspace(); return; }
  if (form.matches("[data-import-confirm-form]")) { event.preventDefault(); replaceStudioFromBackup(); return; }
  if (form.matches("[data-copy-script-form]")) {
    event.preventDefault();
    const script = state.studio.scripts?.[Number(form.dataset.copyScriptForm)];
    if (!script) return;
    if (!navigator.clipboard?.writeText) { announce("当前浏览器未开放剪贴板；请选中文本手动复制"); return; }
    navigator.clipboard.writeText(script).then(() => announce("脚本草稿已复制")).catch(() => announce("浏览器未允许复制，请选中文本手动复制"));
    return;
  }
  if (form.matches("[data-brief-form]")) {
    event.preventDefault();
    clearTimeout(studioSaveTimer);
    saveStudioNow();
    announce("商品事实卡已保存在当前浏览器");
    return;
  }
  if (form.matches("[data-economics-form]")) {
    event.preventDefault();
    state.studio.economicsCalculated = true;
    updateEconomicsResult(true);
    scheduleStudioSave();
    document.querySelector("[data-economics-result]")?.focus();
    return;
  }
  if (form.matches("[data-script-form]")) {
    event.preventDefault();
    if (form.querySelector("[data-generate-scripts]")?.disabled) { announce("请先补齐商品事实与证据来源"); return; }
    state.studio.scripts = buildScripts();
    scheduleStudioSave();
    render();
    document.querySelector("[data-generate-scripts]")?.focus();
  }
});

app.addEventListener("change", (event) => {
  if (event.target.id === "studio-import-file") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1024 * 1024) { announce("备份文件超过 1 MB，未导入"); return; }
    file.text().then((text) => {
      const parsed = JSON.parse(text);
      state.studioPendingImport = normalizeStudio(parsed);
      state.studioConfirmClear = false;
      state.studioConfirmImport = true;
      render();
      document.querySelector("[data-cancel-import]")?.focus();
    }).catch(() => announce("文件不是可识别的 TikTok 工作台 JSON 备份，未更改现有数据"));
    return;
  }
  if (event.target.dataset.eligibility) {
    state.studio.eligibility = event.target.dataset.eligibility;
    scheduleStudioSave();
    render();
    document.querySelector(`[data-eligibility="${state.studio.eligibility}"]`)?.focus();
    return;
  }
  const checkbox = event.target.closest("[data-stage-task]");
  if (!checkbox) return;
  state.studio.tasks[checkbox.dataset.stageTask] = checkbox.checked;
  scheduleStudioSave();
  render();
  document.querySelector(`[data-stage-task="${checkbox.dataset.stageTask}"]`)?.focus();
});

app.addEventListener("keydown", (event) => {
  if (event.target.id === "global-search" && event.key === "Enter" && !event.isComposing && !event.target.isComposing) { event.preventDefault(); searchRoute(); }
  if (event.target.id === "global-search" && event.key === "Escape") { state.query = ""; showSuggestions(""); event.target.value = ""; }
});

app.addEventListener("click", async (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;
  if (target.hasAttribute("data-studio-stage")) { event.preventDefault(); moveToStudioStage(Number(target.dataset.studioStage)); return; }
  if (target.hasAttribute("data-studio-prev") || target.hasAttribute("data-studio-next")) {
    event.preventDefault();
    const current = Number(state.studio.activeStage.slice(-2));
    moveToStudioStage(current + (target.hasAttribute("data-studio-next") ? 1 : -1));
    return;
  }
  if (target.hasAttribute("data-export-studio")) { exportStudio(); return; }
  if (target.hasAttribute("data-import-studio")) { document.querySelector("#studio-import-file")?.click(); return; }
  if (target.hasAttribute("data-confirm-clear")) { state.studioConfirmImport = false; state.studioPendingImport = null; state.studioConfirmClear = true; render(); document.querySelector("[data-cancel-clear]")?.focus(); return; }
  if (target.hasAttribute("data-cancel-clear")) { event.preventDefault(); state.studioConfirmClear = false; render(); document.querySelector("[data-confirm-clear]")?.focus(); return; }
  if (target.hasAttribute("data-cancel-import")) { event.preventDefault(); state.studioConfirmImport = false; state.studioPendingImport = null; render(); document.querySelector("[data-import-studio]")?.focus(); return; }
  if (target.hasAttribute("data-reload-studio")) { window.location.reload(); return; }
  if (target.hasAttribute("data-doc")) { event.preventDefault(); openDoc(target.dataset.doc); return; }
  if (target.hasAttribute("data-agent")) {
    event.preventDefault();
    const id = target.dataset.agent;
    const agent = AGENTS.find((item) => item.id === id);
    const first = state.catalog.find((doc) => doc.path === `Agents/${agent.folder}/SKILL.md`) || state.catalog.find((doc) => doc.path.startsWith(`Agents/${agent.folder}/`));
    if (first) { openDoc(first.path); return; }
    state.view = "library"; state.category = "agents"; state.agent = id; state.selected = ""; render(); return;
  }
  if (target.hasAttribute("data-route")) {
    event.preventDefault();
    state.view = target.dataset.route;
    state.selected = "";
    if (state.view === "home") { state.query = ""; state.category = "all"; state.agent = ""; history.replaceState(null, "", "#home"); }
    else if (state.view === "studio") { state.category = "tiktok-us"; state.agent = ""; history.replaceState(null, "", `#studio=${state.studio.activeStage}`); }
    else { state.view = "library"; state.category = "all"; state.agent = ""; history.replaceState(null, "", state.query ? `#search=${encodeURIComponent(state.query)}` : "#library"); }
    render(); window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); return;
  }
  if (target.hasAttribute("data-category")) {
    state.view = "library"; state.category = target.dataset.category; state.agent = ""; state.selected = ""; history.replaceState(null, "", `#${state.category}`); render(); window.scrollTo({ top: 0, behavior: "smooth" }); return;
  }
  if (target.hasAttribute("data-clear-search")) { state.query = ""; state.selected = ""; const input = document.querySelector("#global-search"); if (input) input.value = ""; showSuggestions(""); if (state.view === "library") render(); input?.focus(); return; }
  if (target.hasAttribute("data-back-to-results")) { state.selected = ""; history.replaceState(null, "", state.query ? `#search=${encodeURIComponent(state.query)}` : `#${state.category}`); render(); return; }
  if (target.hasAttribute("data-scroll")) { document.getElementById(target.dataset.scroll)?.scrollIntoView({ behavior: "smooth" }); return; }
  if (target.hasAttribute("data-copy-doc")) {
    const doc = state.catalog.find((item) => item.path === state.selected);
    if (!doc) return;
    try { await navigator.clipboard.writeText(doc.content); announce("已复制当前文档"); }
    catch { announce("浏览器未允许复制，请打开 GitHub 原文"); }
    return;
  }
  if (target.hasAttribute("data-download-doc")) {
    const doc = state.catalog.find((item) => item.path === state.selected);
    if (!doc) return;
    const url = URL.createObjectURL(new Blob([doc.content], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = basename(doc.path); anchor.click(); URL.revokeObjectURL(url); announce("Markdown 文件已下载"); return;
  }
  if (target.hasAttribute("data-category") || target.hasAttribute("data-agent")) return;
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".top-search")) { const box = document.querySelector("#search-suggestions"); if (box) box.hidden = true; }
});

window.addEventListener("hashchange", () => {
  const hash = new URLSearchParams(location.hash.slice(1));
  const documentPath = hash.get("doc");
  const search = hash.get("search");
  if (documentPath && state.catalog.some((doc) => doc.path === documentPath)) { state.view = "library"; state.selected = documentPath; state.category = categoryFor(documentPath); state.agent = agentFor(documentPath)?.id ?? ""; render(); }
  else if (search !== null) { state.query = search; state.view = "library"; state.selected = ""; render(); }
  else if (hash.has("studio") || location.hash === "#studio") { state.view = "studio"; const stage = hash.get("studio"); if (stage && WORKFLOW_STAGES[Number(stage.slice(-2))]) state.studio.activeStage = stage; render(); }
  else if (location.hash === "#home" || !location.hash) { state.view = "home"; state.selected = ""; render(); }
});

async function boot() {
  try {
    const response = await fetch("/library/catalog.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("catalog unavailable");
    const payload = await response.json();
    state.catalog = payload.documents.map((doc) => ({ ...doc, ...metadataFor(doc) }));
  } catch (error) {
    console.error("Could not load the field library", error);
  }
  state.loaded = true;
  const hash = new URLSearchParams(location.hash.slice(1));
  const documentPath = hash.get("doc");
  if (documentPath && state.catalog.some((doc) => doc.path === documentPath)) { state.view = "library"; state.selected = documentPath; state.category = categoryFor(documentPath); state.agent = agentFor(documentPath)?.id ?? ""; }
  else if (hash.has("search")) { state.view = "library"; state.query = hash.get("search") || ""; }
  else if (hash.has("studio") || location.hash === "#studio") { state.view = "studio"; const stage = hash.get("studio"); if (stage && WORKFLOW_STAGES[Number(stage.slice(-2))]) state.studio.activeStage = stage; }
  else if (["docs", "agents", "templates", "examples", "tiktok-us", "all"].includes(location.hash.slice(1))) { state.view = "library"; state.category = location.hash.slice(1); }
  render();
}

boot();
