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
const state = { catalog: [], loaded: false, view: "home", category: "all", agent: "", query: "", selected: "" };
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

function docsInCategory() {
  let docs = state.catalog.filter((doc) => state.category === "all" || doc.category === state.category);
  if (state.agent) docs = docs.filter((doc) => doc.agent?.id === state.agent);
  const query = state.query.trim().toLocaleLowerCase("zh-CN");
  if (query) docs = docs.filter((doc) => `${doc.title} ${doc.path} ${doc.content}`.toLocaleLowerCase("zh-CN").includes(query));
  return docs;
}

function header() {
  return `<header class="topbar"><a class="brand" href="#home" data-route="home" aria-label="SOP Fieldguide 首页"><span class="brand-mark">CP</span><span><b>跨境运营</b><small>FIELDGUIDE / SOP DESK</small></span></a><nav class="topnav" aria-label="主导航"><button data-route="home" class="nav-link ${state.view === "home" ? "is-active" : ""}">路线总览</button><button data-category="tiktok-us" class="nav-link ${state.category === "tiktok-us" ? "is-active" : ""}">TikTok Shop US</button><button data-route="library" class="nav-link ${state.view === "library" ? "is-active" : ""}">资料索引 <span>${state.catalog.length || "—"}</span></button><a class="nav-link source-link" href="${PROJECT_REPOSITORY}" target="_blank" rel="noreferrer">我的 GitHub ↗</a></nav><div class="top-search"><label class="sr-only" for="global-search">搜索 SOP、Prompt、模板</label><span class="search-icon" aria-hidden="true">⌕</span><input id="global-search" type="text" value="${escapeHtml(state.query)}" placeholder="搜 SOP、Prompt、模板" autocomplete="off" /><button class="search-clear ${state.query ? "" : "is-hidden"}" aria-label="清除搜索" data-clear-search>×</button><span class="search-key">↵</span><div id="search-suggestions" class="suggestions" hidden></div></div></header>`;
}

function routeStop(agent, index) {
  return `<button class="route-stop stop-${agent.id}" data-agent="${agent.id}" aria-label="打开 Agent ${agent.id}：${agent.title}"><span class="stop-no">${agent.id}</span><span class="stop-pin" aria-hidden="true"></span><span class="stop-label">${agent.title}</span><span class="stop-output">${agent.output}</span></button>`;
}

function tiktokRouteStop(stop) {
  return `<button class="tiktok-stop" data-doc="${stop[3]}"><span>${stop[0]}</span><strong>${stop[1]}</strong><small>${stop[2]}</small><i>打开 SOP ↗</i></button>`;
}

function homePage() {
  return `<main>
    <section class="hero" id="home">
      <div class="hero-grid"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> FIELDGUIDE <i>·</i> V0.3 <i>·</i> 7 AGENT SYSTEM</div><h1>把跨境运营，<br /><em>做成可复用的工作流。</em></h1><p class="hero-lede">从市场判断到上架素材，再到广告与评论复盘。把经验拆成可执行的 Prompt、输入模板和验证清单。</p><div class="hero-actions"><button class="button button-signal" data-route="library">进入 SOP 索引 <span>↗</span></button><button class="text-button" data-scroll="route">沿路线浏览 <span>↓</span></button></div><div class="hero-stamp"><span>OPEN SOURCE</span><span>MIT LICENSE</span><span>CHINA → GLOBAL</span></div></div><div class="dispatch-board" aria-label="运营路线卡片"><div class="board-head"><span>OPERATING ROUTE</span><span>01 — 07</span></div><div class="board-track">${AGENTS.map((agent, index) => `<div class="board-row"><b>${agent.id}</b><span class="board-line"></span><strong>${agent.title}</strong><small>${agent.cluster}</small>${index === 6 ? "<span class=\"loop-back\">↶ 回流 03 / 04</span>" : ""}</div>`).join("")}</div><div class="board-foot"><span>输入 → 判断 → 产出 → 复盘</span><span>ROUTE CLOSED</span></div><span class="board-corner" aria-hidden="true">↗</span></div></div>
      <div class="hero-bottom"><span>7 个可复用 Agent</span><span>Prompt + 输入模板 + 真实案例</span><span>合规规则贯穿全链路</span><span>← 从判断开始，闭环到复测</span></div>
    </section>
    <div class="safety-strip"><span class="safety-mark">!</span><p><b>先核合规，再谈增长。</b> 公开资料只收录仓库维护的合规路径。原仓说明中的未删改内部 PDF 不在本站提供；平台规则和费率请以官方后台当前要求为准。</p><button data-doc="docs/03_Compliance_Guard.md">查看合规守卫 ↗</button></div>
    <section class="tiktok-route-section page-width" id="tiktok-us"><div class="section-heading"><div><p class="eyebrow ink-eyebrow">UNITED STATES · TIKTOK SHOP <span>POLICY CHECKED 2026-10-26</span></p><h2>美国站执行路线：先准入，再经营</h2></div><a class="text-button" href="${PROJECT_REPOSITORY}" target="_blank" rel="noreferrer">项目 GitHub ↗</a></div><div class="eligibility-gate"><span class="gate-mark">GATE 00</span><p><b>先在官方 Seller Center 确认法律主体和入驻路径。</b> 当前美国卖家条款适用范围列出美国居民/美国实体，以及面向美国买家的日本跨境卖家；中国境内主体不要默认具备资格。若不确定，先 STOP，不备货、不寄样、不买广告；禁止借身份、虚假地址或绕审。</p><a href="https://seller-us.tiktok.com/university/essay?knowledge_id=1331308753078058" target="_blank" rel="noreferrer">核对官方 Seller Terms ↗</a><button data-doc="TikTokShopUS/00_US_Eligibility.md">打开准入检查表</button></div><div class="tiktok-route-grid">${TIKTOK_STOPS.map(tiktokRouteStop).join("")}</div><p class="tiktok-route-note">这是一套静态资料与人工执行清单，不连接 TikTok 账号、读取后台或自动发布。政策是日期快照，Seller Center 当前提示优先。</p></section>
    <section class="route-section page-width" id="route"><div class="section-heading"><div><p class="eyebrow ink-eyebrow">THE OPERATING ROUTE <span>01 / 07</span></p><h2>一条从选品到复盘的航线</h2></div><p>前置判断交给数据，创意环节交给 Agent，复盘结论再回到内容。</p></div><div class="route-clusters"><span>分析决策</span><i></i><span>内容生产</span><i></i><span>运营复盘</span></div><div class="route-map">${AGENTS.map(routeStop).join("")}</div><div class="loop-note"><span>↶</span><b>闭环回流</b><span>广告与评论结论 → 修正 Listing / 主图 → 复测</span></div></section>
    <section class="start-section"><div class="page-width"><div class="section-heading"><div><p class="eyebrow ink-eyebrow">HOW TO START <span>4 STEPS</span></p><h2>拿一个产品，跑完整条链路</h2></div><button class="text-button" data-category="templates">先看通用模板 ↗</button></div><div class="start-grid"><article><span class="step-mark">A</span><h3>准备真实输入</h3><p>从输入模板开始，整理成本、参数、市场数据与买家反馈。缺数据就标为未知。</p><small>INPUT CONTRACT</small></article><article><span class="step-mark">B</span><h3>按顺序运行</h3><p>把上一步的交付物交给下一 Agent。市场数据先由脚本计算，再交给模型解读。</p><small>HANDOFF</small></article><article><span class="step-mark">C</span><h3>核对再发布</h3><p>用自检清单核对参数来源、平台字段和合规表达，所有结论都能回到输入依据。</p><small>CHECK BEFORE SHIP</small></article><article><span class="step-mark">D</span><h3>用反馈迭代</h3><p>广告和评论只回改对应症状，保留其余有效内容，让复测结果可归因。</p><small>MEASURE & ITERATE</small></article></div></div></section>
    <section class="library-preview page-width"><div class="section-heading"><div><p class="eyebrow ink-eyebrow">THE FIELD LIBRARY <span>${state.catalog.length || "…"} FILES</span></p><h2>每份资料，都能回到来源</h2></div><button class="button button-dark" data-route="library">打开完整资料库 <span>↗</span></button></div><div class="library-shelf">${CATEGORIES.slice(1).map((category, index) => `<button class="shelf-card shelf-${index}" data-category="${category.id}"><span>${String(index + 1).padStart(2, "0")}</span><small>${category.subtitle}</small><strong>${category.title}</strong><i>查看资料 ↗</i></button>`).join("")}</div><p class="library-note">七个通用 Agent · 方法与模板 · 美国 TikTok Shop 的准入、商品、内容、达人、LIVE、履约和复盘流程</p></section>
    <section class="source-note"><div class="page-width source-note-inner"><div><p class="eyebrow">SOURCE & LICENSE</p><h2>每份资料，<br />都能回到真实来源。</h2></div><div><p>通用资料整理自 <a href="${UPSTREAM_REPOSITORY}" target="_blank" rel="noreferrer">上游 MIT 开源仓库 ↗</a>；美国 TikTok Shop 专栏由本项目维护。每份文档卡片均链接到相应仓库原文。</p><a class="source-license" href="/library/LICENSE" target="_blank">查看上游 MIT License ↗</a><small>平台字段、费率与合规要求可能变化；执行前请复核官方最新信息。</small></div></div></section>
  </main>`;
}

function libraryNav() {
  return `<aside class="library-nav"><div class="nav-section"><p class="eyebrow ink-eyebrow">BROWSE</p>${CATEGORIES.map((category) => `<button class="category-button ${state.category === category.id && !state.agent ? "is-active" : ""}" data-category="${category.id}"><span>${category.title}</span><small>${category.subtitle}</small></button>`).join("")}</div><div class="nav-section agent-nav"><p class="eyebrow ink-eyebrow">THE 7 AGENTS</p>${AGENTS.map((agent) => `<button class="agent-nav-button ${state.agent === agent.id ? "is-active" : ""}" data-agent="${agent.id}"><span>${agent.id}</span><b>${agent.title}</b><small>${agent.output}</small></button>`).join("")}</div><a class="repo-card" href="${PROJECT_REPOSITORY}" target="_blank" rel="noreferrer"><span>↗</span><b>打开我的 GitHub 仓库</b><small>查看 TikTok SOP 与站点源文件</small></a><a class="repo-card upstream-card" href="${UPSTREAM_REPOSITORY}" target="_blank" rel="noreferrer"><span>↗</span><b>查看上游资料原仓</b><small>七个通用 Agent · MIT License</small></a></aside>`;
}

function docCard(doc) {
  const meta = metadataFor(doc);
  return `<button class="doc-card" data-doc="${escapeHtml(doc.path)}"><span class="doc-type">${meta.type}</span><span class="doc-title">${escapeHtml(meta.title)}</span><span class="doc-path">${escapeHtml(doc.path)}</span><span class="doc-summary">${escapeHtml(meta.summary)}</span><span class="doc-open">打开资料 ↗</span></button>`;
}

function renderList() {
  const docs = docsInCategory();
  const category = CATEGORIES.find((item) => item.id === state.category)?.title ?? "全部资料";
  return `<div class="library-results"><div class="library-results-head"><div><p class="eyebrow ink-eyebrow">${state.agent ? `AGENT ${state.agent}` : CATEGORIES.find((item) => item.id === state.category)?.subtitle || "ALL FIELD NOTES"}</p><h1>${state.agent ? AGENTS.find((item) => item.id === state.agent)?.title : category}</h1></div><span class="result-count">${docs.length} 份资料</span></div>${state.query ? `<p class="query-note">“${escapeHtml(state.query)}” 的本地搜索结果</p>` : ""}${docs.length ? `<div class="doc-list">${docs.map(docCard).join("")}</div>` : `<div class="empty-state"><span>⌕</span><h2>没有找到匹配资料</h2><p>试试更短的关键词，或切换资料分类。</p><button class="text-button" data-clear-search>清空搜索 ↗</button></div>`}</div>`;
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

function render() {
  app.innerHTML = `${header()}${state.loaded ? (state.view === "home" ? homePage() : libraryPage()) : `<main class="loading-state"><span class="route-loader"></span><p>正在装载运营资料…</p></main>`}<footer class="footer"><div class="page-width"><a class="brand footer-brand" href="#home" data-route="home"><span class="brand-mark">CP</span><span><b>跨境运营</b><small>FIELDGUIDE / SOP DESK</small></span></a><p>为真实经营判断服务。平台规则以官方信息为准。</p><a href="${PROJECT_REPOSITORY}" target="_blank" rel="noreferrer">项目 GitHub ↗</a><a href="${UPSTREAM_REPOSITORY}" target="_blank" rel="noreferrer">上游仓库 ↗</a><small>© Upstream contributors · MIT License</small></div></footer><div class="toast" role="status" aria-live="polite"></div>`;
  if (state.view === "library" && state.selected) {
    const doc = state.catalog.find((item) => item.path === state.selected);
    const body = document.querySelector("#markdown-body");
    if (doc && body) body.replaceChildren(renderMarkdown(doc));
  }
}

function showSuggestions(input) {
  const box = document.querySelector("#search-suggestions");
  const clear = document.querySelector("[data-clear-search]");
  if (!box) return;
  const query = input.trim().toLocaleLowerCase("zh-CN");
  clear?.classList.toggle("is-hidden", !query);
  if (!query) { box.hidden = true; box.innerHTML = ""; return; }
  const matches = state.catalog.filter((doc) => `${doc.title} ${doc.path} ${doc.content}`.toLocaleLowerCase("zh-CN").includes(query)).slice(0, 5);
  box.innerHTML = `${matches.length ? matches.map((doc) => `<button data-doc="${escapeHtml(doc.path)}"><span>${escapeHtml(titleFrom(doc))}</span><small>${escapeHtml(doc.path)}</small></button>`).join("") : `<p>没有匹配资料</p>`}<button class="suggestion-all" data-route="library">查看全部搜索结果 ↵</button>`;
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
  if (event.target.id !== "global-search") return;
  state.query = event.target.value;
  showSuggestions(state.query);
});

app.addEventListener("keydown", (event) => {
  if (event.target.id === "global-search" && event.key === "Enter") { event.preventDefault(); searchRoute(); }
  if (event.target.id === "global-search" && event.key === "Escape") { state.query = ""; showSuggestions(""); event.target.value = ""; }
});

app.addEventListener("click", async (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;
  if (target.hasAttribute("data-doc")) { event.preventDefault(); openDoc(target.dataset.doc); return; }
  if (target.hasAttribute("data-agent")) {
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
    else { state.category = "all"; state.agent = ""; history.replaceState(null, "", state.query ? `#search=${encodeURIComponent(state.query)}` : "#library"); }
    render(); window.scrollTo({ top: 0, behavior: "smooth" }); return;
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
  else if (["docs", "agents", "templates", "examples", "tiktok-us", "all"].includes(location.hash.slice(1))) { state.view = "library"; state.category = location.hash.slice(1); }
  render();
}

boot();
