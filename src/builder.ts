import { ParsedNote } from "./parser";

export interface SiteFile {
  path: string;
  content: string;
}

export interface BuildResult {
  files: SiteFile[];
  pageCount: number;
}

/**
 * Converts parsed notes into a collection of HTML files ready for deployment.
 */
export function buildSite(notes: ParsedNote[], siteTitle: string): BuildResult {
  const pages = notes.map((note) => buildPage(note, siteTitle));
  const index = buildIndex(notes, siteTitle);

  return {
    files: [index, ...pages],
    pageCount: pages.length,
  };
}

function buildPage(note: ParsedNote, siteTitle: string): SiteFile {
  const title = note.frontmatter.title ?? note.slug;
  const description = note.frontmatter.description ?? "";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(description)}" />
  <title>${escapeHtml(title)} — ${escapeHtml(siteTitle)}</title>
  <link rel="stylesheet" href="../style.css" />
</head>
<body>
  <header>
    <a href="../index.html">${escapeHtml(siteTitle)}</a>
  </header>
  <main>
    <h1>${escapeHtml(title)}</h1>
    ${note.frontmatter.date ? `<time>${escapeHtml(String(note.frontmatter.date))}</time>` : ""}
    <article>${markdownToHtml(note.body)}</article>
  </main>
</body>
</html>`;

  return { path: `pages/${note.slug}.html`, content: html };
}

function buildIndex(notes: ParsedNote[], siteTitle: string): SiteFile {
  const items = notes
    .map((n) => {
      const title = n.frontmatter.title ?? n.slug;
      const desc = n.frontmatter.description ?? "";
      return `<li>
      <a href="pages/${n.slug}.html">${escapeHtml(title)}</a>
      ${desc ? `<p>${escapeHtml(desc)}</p>` : ""}
    </li>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(siteTitle)}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <h1>${escapeHtml(siteTitle)}</h1>
  </header>
  <main>
    <ul class="note-list">
      ${items}
    </ul>
  </main>
</body>
</html>`;

  return { path: "index.html", content: html };
}

/** Minimal Markdown → HTML: headings, bold, italic, links, paragraphs. */
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
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[h|p|u|o|l])(.+)$/gm, "<p>$1</p>")
    .trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
