import type { MouseEvent } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import dealAppetiteMarkdown from "./content/deal-appetite-experiment.md?raw";
import "katex/dist/katex.min.css";

type BlogArticlePageProps = {
  onNavigateHome: (event?: MouseEvent<HTMLAnchorElement>) => void;
};

const links = {
  github: "https://github.com/vbnovikov",
  linkedin: "https://www.linkedin.com/in/vladimirbelsch/",
};

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

export default function BlogArticlePage({ onNavigateHome }: BlogArticlePageProps) {
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
        <article className="article-shell">
          <a className="article-back-link" href="/" onClick={onNavigateHome}>
            <ArrowLeft aria-hidden="true" className="link-icon" />
            Home
          </a>
          <ReactMarkdown components={markdownComponents} rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]}>
            {dealAppetiteMarkdown}
          </ReactMarkdown>
        </article>
      </main>

      <footer className="site-footer">
        <div className="section-inner footer-inner">
          <p>© 2026 Vladimir Belsch</p>
        </div>
      </footer>
    </>
  );
}
