import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const articleDir = path.join(distDir, "blog", "deal-appetite-experiment");
const markdownPath = path.join(projectRoot, "src", "content", "deal-appetite-experiment.md");
const indexPath = path.join(distDir, "index.html");
const outputPath = path.join(articleDir, "index.html");
const markdownOutputPath = path.join(articleDir, "index.md");

const articleTitle = "Deal Appetite Experiment | Vladimir Belsch";
const articleUrl = "https://vladimirbelsch.com/blog/deal-appetite-experiment/";
const articleMarkdownUrl = "https://vladimirbelsch.com/blog/deal-appetite-experiment/index.md";
const articleDate = "2026-08-31";
const articleDescription =
  "A technical essay moving from a broad sales-ranking conjecture toward stateful process prediction and graph-shaped CRM context.";

const links = {
  github: "https://github.com/vbnovikov",
  linkedin: "https://www.linkedin.com/in/vladimirbelsch/",
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const plainHeadingText = (heading) =>
  heading
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\$+/g, "")
    .replace(/\\_/g, "_")
    .replace(/\\/g, "")
    .trim();

const slugBase = (value) =>
  plainHeadingText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

const buildArticleSections = (markdown) => {
  const seen = new Map();
  const sections = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const match = /^(##|###)\s+(.+)$/.exec(line);

    if (!match) {
      continue;
    }

    const depth = match[1].length;
    const title = plainHeadingText(match[2]);
    const base = slugBase(match[2]);
    const count = seen.get(base) ?? 0;

    seen.set(base, count + 1);

    sections.push({
      depth,
      id: count === 0 ? base : `${base}-${count + 1}`,
      title,
    });
  }

  return sections;
};

const addHeadingIds = (sections) => {
  return () => {
    return (tree) => {
      let headingIndex = 0;

      const walk = (node) => {
        if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
          const section = sections[headingIndex++];

          if (section) {
            node.data = {
              ...node.data,
              hProperties: {
                ...node.data?.hProperties,
                id: section.id,
              },
            };
          }
        }

        node.children?.forEach(walk);
      };

      walk(tree);
    };
  };
};

const renderMarkdown = async (markdown, sections) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(addHeadingIds(sections))
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
};

const renderToc = (sections) =>
  sections
    .map(
      (section) => `
                <a class="article-toc-link article-toc-depth-${section.depth}" href="#${escapeHtml(section.id)}">
                  ${escapeHtml(section.title)}
                </a>`,
    )
    .join("");

const renderStaticShell = (articleHtml, sections) => `
      <a class="skip-link" href="#article">
        Skip to article
      </a>

      <header class="site-header">
        <nav class="nav-shell" aria-label="Primary navigation">
          <a class="brand" href="/" aria-label="Vladimir Belsch home">Vladimir Belsch</a>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/#blog">Blog</a>
            <a href="${links.github}" target="_blank" rel="noreferrer">GitHub</a>
            <a href="${links.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </nav>
      </header>

      <main id="article" class="article-page">
        <div class="article-layout">
          <aside class="article-toc" aria-label="Article sections">
            <p class="article-toc-title">Sections</p>
            <nav>${renderToc(sections)}
            </nav>
          </aside>

          <article class="article-shell">
            <a class="article-back-link" href="/">← Home</a>
            ${articleHtml}
          </article>
        </div>
      </main>

      <footer class="site-footer">
        <div class="section-inner footer-inner">
          <p>© 2026 Vladimir Belsch</p>
        </div>
      </footer>`;

const replaceRootContent = (html, staticShell) => {
  const rootStart = '<div id="root">';
  const rootEnd = "\n    </div>\n  </body>";
  const rootStartIndex = html.indexOf(rootStart);
  const rootEndIndex = html.indexOf(rootEnd, rootStartIndex);

  if (rootStartIndex === -1 || rootEndIndex === -1) {
    throw new Error("Could not find root container in dist/index.html.");
  }

  return `${html.slice(0, rootStartIndex + rootStart.length)}
${staticShell}
    </div>
${html.slice(rootEndIndex + rootEnd.length - "  </body>".length)}`;
};

const insertHeadContent = (html, content) => html.replace("</head>", `${content}\n  </head>`);

const upsertNameMeta = (html, name, content) => {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+name="${name}"[\\s\\S]*?>`);

  return pattern.test(html) ? html.replace(pattern, tag) : insertHeadContent(html, `    ${tag}`);
};

const upsertPropertyMeta = (html, property, content) => {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+property="${property}"[\\s\\S]*?>`);

  return pattern.test(html) ? html.replace(pattern, tag) : insertHeadContent(html, `    ${tag}`);
};

const upsertCanonical = (html, href) => {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const pattern = /<link\s+rel="canonical"[\s\S]*?>/;

  return pattern.test(html) ? html.replace(pattern, tag) : insertHeadContent(html, `    ${tag}`);
};

const addArticleAlternateLinks = (html) =>
  insertHeadContent(
    html,
    `    <link rel="alternate" type="text/markdown" href="${articleMarkdownUrl}" title="Markdown source for Deal Appetite Experiment" />`,
  );

const addArticleStructuredData = (html) => {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Deal Appetite Experiment",
    description: articleDescription,
    author: {
      "@type": "Person",
      name: "Vladimir Belsch",
      url: "https://vladimirbelsch.com/",
      sameAs: [links.github, links.linkedin],
    },
    datePublished: articleDate,
    dateModified: articleDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
    articleSection: "Experiments",
    keywords: [
      "CRM",
      "sales prediction",
      "ranking models",
      "process mining",
      "graph context",
      "machine learning",
    ],
  };

  const json = JSON.stringify(articleData, null, 6)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");

  return insertHeadContent(
    html,
    `    <script type="application/ld+json">\n${json}\n    </script>`,
  );
};

const addArticleCss = (html) => {
  const articleCssFiles = fs
    .readdirSync(path.join(distDir, "assets"))
    .filter((fileName) => /^BlogArticlePage-.*\.css$/.test(fileName))
    .sort();

  const linksHtml = articleCssFiles
    .map((fileName) => `    <link rel="stylesheet" crossorigin href="/assets/${fileName}" />`)
    .join("\n");

  if (!linksHtml) {
    throw new Error("Could not find the built article CSS asset.");
  }

  return insertHeadContent(html, linksHtml);
};

const markdown = fs.readFileSync(markdownPath, "utf8");
const sections = buildArticleSections(markdown);
const articleHtml = await renderMarkdown(markdown, sections);
const staticShell = renderStaticShell(articleHtml, sections);

let html = fs.readFileSync(indexPath, "utf8");

html = html.replace(
  /<title>.*?<\/title>/,
  `<title>${articleTitle}</title>`,
);
html = upsertNameMeta(html, "description", articleDescription);
html = upsertNameMeta(html, "robots", "index,follow");
html = upsertNameMeta(html, "twitter:card", "summary");
html = upsertNameMeta(html, "twitter:title", articleTitle);
html = upsertNameMeta(html, "twitter:description", articleDescription);
html = upsertPropertyMeta(html, "og:type", "article");
html = upsertPropertyMeta(html, "og:url", articleUrl);
html = upsertPropertyMeta(html, "og:title", articleTitle);
html = upsertPropertyMeta(html, "og:description", articleDescription);
html = upsertPropertyMeta(html, "og:locale", "en_US");
html = upsertPropertyMeta(html, "article:author", "Vladimir Belsch");
html = upsertPropertyMeta(html, "article:published_time", articleDate);
html = upsertPropertyMeta(html, "article:modified_time", articleDate);
html = upsertPropertyMeta(html, "article:section", "Experiments");
html = upsertCanonical(html, articleUrl);
html = addArticleAlternateLinks(html);
html = addArticleCss(html);
html = addArticleStructuredData(html);
html = replaceRootContent(html, staticShell);

fs.mkdirSync(articleDir, { recursive: true });
fs.writeFileSync(outputPath, html);
fs.writeFileSync(markdownOutputPath, markdown);

console.log(`Rendered static article to ${path.relative(projectRoot, outputPath)}`);
console.log(`Rendered article markdown to ${path.relative(projectRoot, markdownOutputPath)}`);
