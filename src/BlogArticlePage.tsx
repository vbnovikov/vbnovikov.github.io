import type { MouseEvent } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import dealAppetiteMarkdown from "./content/deal-appetite-experiment.md?raw";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

type BlogArticlePageProps = {
  onNavigateHome: (event?: MouseEvent<HTMLAnchorElement>) => void;
};

type ArticleSection = {
  depth: 2 | 3;
  id: string;
  title: string;
};

type MarkdownAstNode = {
  children?: MarkdownAstNode[];
  data?: {
    hProperties?: Record<string, string>;
  };
  depth?: number;
  type?: string;
};

const links = {
  github: "https://github.com/vbnovikov",
  linkedin: "https://www.linkedin.com/in/vladimirbelsch/",
};

const plainHeadingText = (heading: string) =>
  heading
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\$+/g, "")
    .replace(/\\_/g, "_")
    .replace(/\\/g, "")
    .trim();

const slugBase = (value: string) =>
  plainHeadingText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

const buildArticleSections = (markdown: string): ArticleSection[] => {
  const seen = new Map<string, number>();
  const sections: ArticleSection[] = [];
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

    const depth = match[1].length as 2 | 3;
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

const articleSections = buildArticleSections(dealAppetiteMarkdown);

const addHeadingIds = () => {
  return (tree: MarkdownAstNode) => {
    let headingIndex = 0;

    const walk = (node: MarkdownAstNode) => {
      if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
        const section = articleSections[headingIndex++];

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

export default function BlogArticlePage({ onNavigateHome }: BlogArticlePageProps) {
  const markdownComponents: Components = {
    a({ children, href }) {
      const isExternal = href?.startsWith("http");

      return (
        <a href={href} rel={isExternal ? "noreferrer" : undefined} target={isExternal ? "_blank" : undefined}>
          {children}
          {isExternal ? <ExternalLink aria-hidden="true" className="article-inline-icon" /> : null}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="article-table-scroll">
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <>
      <a className="skip-link" href="#article">
        Skip to article
      </a>

      <header className="site-header">
        <nav className="nav-shell" aria-label="Primary navigation">
          <a className="brand" href="/" onClick={onNavigateHome} aria-label="Vladimir Belsch home">
            Vladimir Belsch
          </a>
          <div className="nav-links">
            <a href="/" onClick={onNavigateHome}>
              Home
            </a>
            <a href="/#blog">Blog</a>
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </nav>
      </header>

      <main id="article" className="article-page">
        <div className="article-layout">
          <aside className="article-toc" aria-label="Article sections">
            <p className="article-toc-title">Sections</p>
            <nav>
              {articleSections.map((section) => (
                <a
                  className={`article-toc-link article-toc-depth-${section.depth}`}
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="article-shell">
            <a className="article-back-link" href="/" onClick={onNavigateHome}>
              <ArrowLeft aria-hidden="true" className="link-icon" />
              Home
            </a>
            <ReactMarkdown
              components={markdownComponents}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
              remarkPlugins={[remarkGfm, remarkMath, addHeadingIds]}
            >
              {dealAppetiteMarkdown}
            </ReactMarkdown>
          </article>
        </div>
      </main>

      <footer className="site-footer">
        <div className="section-inner footer-inner">
          <p>© 2026 Vladimir Belsch</p>
        </div>
      </footer>
    </>
  );
}
