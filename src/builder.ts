import { ParsedNote } from "./parser";

export interface SiteFile {
  path: string;
  content: string;
}

export interface BuildResult {
  files: SiteFile[];
  pageCount: number;
  imageMap: Map<string, string>; // deployPath ("images/x.png") → vault path
}

// ── Theme constants ───────────────────────────────────────────────────────────

const CARD_COLORS = ["#FF4D00", "#FFE500", "#C8FF00", "#0A0A0A"];
const CARD_TEXT   = ["#FFFFFF", "#0A0A0A", "#0A0A0A", "#FFFFFF"];

// ── Base CSS (no external framework) ─────────────────────────────────────────

const BASE_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #F5F4EF; color: #0A0A0A; font-family: 'DM Sans', sans-serif; line-height: 1.6; }
a { color: inherit; }
img { max-width: 100%; height: auto; display: block; }
h1, h2, h3, h4, h5, h6 { font-family: 'Syne', sans-serif; font-weight: 800; line-height: 1.1; }

/* ── Nav ── */
.vf-nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: #F5F4EF; border-bottom: 2px solid #0A0A0A; }
.vf-nav-name { font-family: 'Syne', sans-serif; font-size: 1.15rem; font-weight: 800; text-decoration: none; color: #0A0A0A; }
.vf-nav-links { display: flex; align-items: center; gap: 1.5rem; }
.vf-nav-link { font-weight: 600; font-size: 0.9rem; text-decoration: none; color: #0A0A0A; }
.vf-nav-link:hover { text-decoration: underline; }
.vf-hire-btn { background: #0A0A0A; color: #F5F4EF !important; padding: 0.45rem 1.1rem; border: 2px solid #0A0A0A; box-shadow: 4px 4px 0px #0A0A0A; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.875rem; text-decoration: none; display: inline-block; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.vf-hire-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #0A0A0A; }

/* ── Hero ── */
.vf-hero { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
.vf-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: #FF4D00; color: #fff; padding: 0.28rem 0.75rem; border: 2px solid #0A0A0A; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.vf-hero-title { font-size: clamp(2.5rem, 8vw, 6rem); font-weight: 800; line-height: 1; margin: 1rem 0; text-transform: uppercase; letter-spacing: -0.02em; }
.vf-hero-bio { font-size: 1.05rem; color: #555; max-width: 540px; line-height: 1.7; }
.vf-stats { display: flex; gap: 3rem; margin-top: 2.5rem; flex-wrap: wrap; }
.vf-stat-num { font-family: 'Syne', sans-serif; font-size: 3.5rem; font-weight: 800; line-height: 1; }
.vf-stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #777; margin-top: 0.25rem; }

/* ── Marquee ── */
.vf-marquee-wrap { overflow: hidden; border-top: 2px solid #0A0A0A; background: #FF4D00; padding: 0.65rem 0; }
@keyframes vf-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.vf-marquee { display: inline-flex; white-space: nowrap; animation: vf-scroll 30s linear infinite; }
.vf-marquee-item { margin-right: 2.5rem; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #fff; }

/* ── Section ── */
.vf-section { padding: 3rem 2rem; max-width: 1200px; margin: 0 auto; }
.vf-section-title { font-size: 2rem; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #0A0A0A; }

/* ── Cards ── */
.vf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 1.5rem; }
.vf-card { border: 2px solid #0A0A0A; box-shadow: 4px 4px 0px #0A0A0A; text-decoration: none; color: #0A0A0A; display: flex; flex-direction: column; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.vf-card:hover { transform: translate(-3px, -3px); box-shadow: 7px 7px 0px #0A0A0A; }
.vf-card-header { padding: 1.5rem; border-bottom: 2px solid #0A0A0A; }
.vf-card-title { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; line-height: 1.2; }
.vf-card-body { padding: 1.25rem; background: #F5F4EF; flex: 1; display: flex; flex-direction: column; }
.vf-card-desc { color: #555; font-size: 0.9rem; line-height: 1.65; flex: 1; }
.vf-card-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.875rem; border-top: 1px solid #ddd; }
.vf-card-year { font-size: 0.78rem; font-weight: 600; color: #999; letter-spacing: 0.06em; }
.vf-arrow { background: #0A0A0A; color: #F5F4EF; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }

/* ── Tags ── */
.vf-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.75rem; }
.vf-tag { font-size: 0.68rem; font-weight: 700; padding: 0.18rem 0.55rem; border: 1.5px solid #0A0A0A; text-transform: uppercase; letter-spacing: 0.06em; }

/* ── Footer ── */
.vf-footer { background: #0A0A0A; color: #F5F4EF; padding: 1.75rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-top: 2px solid #0A0A0A; }
.vf-footer-name { font-family: 'Syne', sans-serif; font-weight: 700; }
.vf-footer-credit { font-size: 0.825rem; opacity: 0.5; }
.vf-footer-links { display: flex; gap: 1.5rem; }
.vf-footer-link { color: #F5F4EF; text-decoration: none; font-size: 0.875rem; opacity: 0.7; }
.vf-footer-link:hover { opacity: 1; text-decoration: underline; }

/* ── Project page ── */
.vf-project-header { padding: 3rem 2rem; border-bottom: 2px solid #0A0A0A; }
.vf-project-inner { max-width: 1200px; margin: 0 auto; }
.vf-project-title { font-size: clamp(2rem, 5vw, 3.75rem); font-weight: 800; line-height: 1.05; text-transform: uppercase; letter-spacing: -0.02em; }
.vf-back-btn { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.15); color: #fff !important; padding: 0.4rem 0.9rem; border: 2px solid #fff; font-weight: 700; font-size: 0.825rem; text-decoration: none; margin-bottom: 1.5rem; transition: background 0.15s ease; }
.vf-back-btn:hover { background: rgba(255,255,255,0.3); }

/* ── Prose ── */
.vf-prose { max-width: 720px; padding: 3rem 2rem; margin: 0 auto; }
.vf-prose h1 { font-size: 2rem; margin: 2rem 0 0.75rem; }
.vf-prose h2 { font-size: 1.625rem; margin: 2rem 0 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid #0A0A0A; }
.vf-prose h3 { font-size: 1.25rem; margin: 1.75rem 0 0.6rem; }
.vf-prose h4, .vf-prose h5, .vf-prose h6 { font-size: 1.05rem; margin: 1.5rem 0 0.5rem; }
.vf-prose p { margin: 1rem 0; color: #333; line-height: 1.8; }
.vf-prose a { color: #FF4D00; text-decoration: underline; font-weight: 500; }
.vf-prose a:hover { color: #cc3d00; }
.vf-prose strong { font-weight: 700; color: #0A0A0A; }
.vf-prose em { font-style: italic; }
.vf-prose ul { list-style: disc; padding-left: 1.5rem; margin: 1rem 0; }
.vf-prose ol { list-style: decimal; padding-left: 1.5rem; margin: 1rem 0; }
.vf-prose li { margin: 0.4rem 0; line-height: 1.75; color: #333; }
.vf-prose code { background: #0A0A0A; color: #F5F4EF; padding: 0.15rem 0.4rem; font-size: 0.875em; font-family: 'Courier New', monospace; }
.vf-prose pre { background: #0A0A0A; color: #F5F4EF; padding: 1.5rem; overflow-x: auto; margin: 1.5rem 0; border: 2px solid #0A0A0A; box-shadow: 4px 4px 0px rgba(10,10,10,0.25); }
.vf-prose pre code { background: none; padding: 0; }
.vf-prose blockquote { border-left: 4px solid #FF4D00; padding: 0.5rem 0 0.5rem 1rem; color: #555; font-style: italic; margin: 1.5rem 0; background: #fff; }
.vf-prose hr { border: none; border-top: 2px solid #0A0A0A; margin: 2.5rem 0; }
.vf-prose img { border: 2px solid #0A0A0A; box-shadow: 4px 4px 0px #0A0A0A; margin: 1.5rem 0; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .vf-nav { padding: 0.75rem 1rem; }
  .vf-nav-links { gap: 0.75rem; }
  .vf-hero, .vf-section { padding: 2rem 1rem; }
  .vf-project-header, .vf-prose { padding: 2rem 1rem; }
  .vf-stat-num { font-size: 2.5rem; }
  .vf-stats { gap: 1.5rem; }
  .vf-footer { padding: 1.5rem 1rem; flex-direction: column; text-align: center; }
  .vf-footer-links { justify-content: center; }
}
`.trim();

// ── Shared fragments ──────────────────────────────────────────────────────────

function htmlHead(pageTitle: string): string {
  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <style>${BASE_CSS}</style>`;
}

function renderNav(siteName: string, root = ""): string {
  return `<nav class="vf-nav">
  <a href="${root}index.html" class="vf-nav-name">${escapeHtml(siteName)}</a>
  <div class="vf-nav-links">
    <a href="${root}index.html#work" class="vf-nav-link">Work</a>
    <a href="${root}index.html#about" class="vf-nav-link">About</a>
    <a href="mailto:" class="vf-hire-btn">Hire&nbsp;me</a>
  </div>
</nav>`;
}

function renderFooter(siteName: string, root = ""): string {
  return `<footer class="vf-footer">
  <span class="vf-footer-name">${escapeHtml(siteName)}</span>
  <span class="vf-footer-credit">Built with VaultFolio</span>
  <div class="vf-footer-links">
    <a href="${root}index.html#work" class="vf-footer-link">Work</a>
    <a href="${root}index.html#about" class="vf-footer-link">About</a>
  </div>
</footer>`;
}

// ── Entry point ───────────────────────────────────────────────────────────────

export function buildSite(notes: ParsedNote[], siteTitle: string): BuildResult {
  const pages = notes.map((note) => buildPage(note, siteTitle));
  const index = buildIndex(notes, siteTitle);
  return { files: [index, ...pages], pageCount: pages.length, imageMap: new Map() };
}

// ── Index page ────────────────────────────────────────────────────────────────

function buildIndex(notes: ParsedNote[], siteTitle: string): SiteFile {
  // Marquee ticker — all unique tags, duplicated for seamless loop
  const allTags = collectTags(notes);
  const tickerItems = (allTags.length > 0 ? allTags : ["PORTFOLIO", "WORK", "PROJECTS", "DESIGN", "CODE"])
    .map((t) => `<span class="vf-marquee-item">★&nbsp;${escapeHtml(t.toUpperCase())}</span>`)
    .join("");
  const marquee = tickerItems + tickerItems;

  // Project cards
  const cards = notes
    .map((n, i) => {
      const bg   = CARD_COLORS[i % CARD_COLORS.length];
      const fg   = CARD_TEXT[i % CARD_TEXT.length];
      const title = (n.frontmatter.title as string | undefined) ?? n.slug;
      const tags  = Array.isArray(n.frontmatter.tags) ? (n.frontmatter.tags as string[]) : [];
      const rawDesc = n.body
        .replace(/!\[\[[^\]]+\]\]/g, "")
        .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
        .replace(/<[^>]*>/g, "")
        .trim();
      const desc = rawDesc.slice(0, 150) + (rawDesc.length > 150 ? "…" : "");
      const year = extractYear(n.frontmatter.date as string | undefined);
      const tagChips = tags
        .map((t) => `<span class="vf-tag" style="color:${fg};border-color:${fg}">${escapeHtml(t)}</span>`)
        .join("");

      return `<a href="pages/${n.slug}.html" class="vf-card">
  <div class="vf-card-header" style="background:${bg};color:${fg}">
    <div class="vf-card-title">${escapeHtml(title)}</div>
    ${tags.length > 0 ? `<div class="vf-tags">${tagChips}</div>` : ""}
  </div>
  <div class="vf-card-body">
    ${desc ? `<p class="vf-card-desc">${escapeHtml(desc)}</p>` : ""}
    <div class="vf-card-foot">
      <span class="vf-card-year">${escapeHtml(year)}</span>
      <span class="vf-arrow">→</span>
    </div>
  </div>
</a>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${htmlHead(escapeHtml(siteTitle))}
</head>
<body>

${renderNav(siteTitle)}

<div style="border-bottom:2px solid #0A0A0A">
  <section class="vf-hero">
    <div class="vf-badge">● AVAILABLE FOR WORK</div>
    <h1 class="vf-hero-title">${escapeHtml(siteTitle)}</h1>
    <p class="vf-hero-bio">Crafting digital experiences — one project at a time.</p>
    <div class="vf-stats">
      <div>
        <div class="vf-stat-num">${String(notes.length).padStart(2, "0")}</div>
        <div class="vf-stat-label">Projects</div>
      </div>
      <div>
        <div class="vf-stat-num">${getEstYear(notes)}</div>
        <div class="vf-stat-label">Est.</div>
      </div>
    </div>
  </section>
  <div class="vf-marquee-wrap">
    <div class="vf-marquee">${marquee}</div>
  </div>
</div>

<section class="vf-section" id="work">
  <h2 class="vf-section-title">Work</h2>
  ${notes.length > 0
    ? `<div class="vf-grid">\n${cards}\n</div>`
    : `<p style="color:#777;font-size:1rem">No published projects yet.</p>`}
</section>

${renderFooter(siteTitle)}

</body>
</html>`;

  return { path: "index.html", content: html };
}

// ── Project page ──────────────────────────────────────────────────────────────

function buildPage(note: ParsedNote, siteTitle: string): SiteFile {
  const title       = (note.frontmatter.title as string | undefined) ?? note.slug;
  const description = (note.frontmatter.description as string | undefined) ?? "";
  const date        = note.frontmatter.date as string | undefined;
  const tags        = Array.isArray(note.frontmatter.tags) ? (note.frontmatter.tags as string[]) : [];
  const tagChips    = tags
    .map((t) => `<span class="vf-tag" style="color:#fff;border-color:#fff">${escapeHtml(String(t))}</span>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${htmlHead(`${escapeHtml(title)} — ${escapeHtml(siteTitle)}`)}
  <meta name="description" content="${escapeHtml(description)}" />
</head>
<body>

${renderNav(siteTitle, "../")}

<div class="vf-project-header" style="background:#FF4D00;color:#fff;border-bottom:2px solid #0A0A0A">
  <div class="vf-project-inner">
    <a href="../index.html" class="vf-back-btn">← Back</a>
    <h1 class="vf-project-title">${escapeHtml(title)}</h1>
    ${date ? `<p style="margin-top:0.6rem;font-size:0.9rem;opacity:0.8">${escapeHtml(String(date))}</p>` : ""}
    ${tags.length > 0 ? `<div class="vf-tags" style="margin-top:1rem">${tagChips}</div>` : ""}
  </div>
</div>

<div class="vf-prose">
  ${markdownToHtml(note.body)}
</div>

${renderFooter(siteTitle, "../")}

</body>
</html>`;

  return { path: `pages/${note.slug}.html`, content: html };
}

// ── Markdown → HTML ───────────────────────────────────────────────────────────

function markdownToHtml(md: string): string {
  return md
    .replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>")
    .replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    // Wikilink images — must precede link regex
    .replace(/!\[\[([^\]]+)\]\]/g, (_, ref) => {
      const name = ref.split("|")[0].trim().split("/").pop() ?? ref;
      return `<img src="../images/${encodeURIComponent(name)}" alt="${escapeHtml(name)}" />`;
    })
    // Markdown images — must precede link regex
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, rawSrc) => {
      const src = rawSrc.trim().replace(/\s+["'][^"']*["']\s*$/, "");
      if (/^https?:\/\//.test(src)) {
        return `<img src="${src}" alt="${escapeHtml(alt)}" />`;
      }
      const name = src.split("/").pop() ?? src;
      return `<img src="../images/${encodeURIComponent(name)}" alt="${escapeHtml(alt)}" />`;
    })
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^---$/gm, "<hr>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[h1-6polbui])(.+)$/gm, "<p>$1</p>")
    .trim();
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function collectTags(notes: ParsedNote[]): string[] {
  const seen = new Set<string>();
  for (const n of notes) {
    const t = n.frontmatter.tags;
    if (Array.isArray(t)) t.forEach((tag) => seen.add(String(tag)));
  }
  return [...seen];
}

function getEstYear(notes: ParsedNote[]): string {
  const years = notes
    .map((n) => extractYear(n.frontmatter.date as string | undefined))
    .filter((y) => y !== "—")
    .map(Number)
    .filter((y) => y > 1900 && y <= new Date().getFullYear() + 1);
  return years.length > 0 ? String(Math.min(...years)) : String(new Date().getFullYear());
}

function extractYear(date: string | undefined): string {
  if (!date) return "—";
  const m = date.match(/\d{4}/);
  return m ? m[0] : "—";
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
