import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { refreshOnceForStaleModule } from "./refreshRecovery";

type Project = {
  category: string;
  title: string;
  summary: string;
  href: string;
  tags: string[];
};

type CapabilityGroup = {
  detail?: CapabilityDetail;
  description: string;
  id: string;
  title: string;
  items: string[];
};

type RelatedWork = {
  category: string;
  href: string;
  summary: string;
  title: string;
};

type CapabilityDetail = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  metadata: string;
  relatedProjects: RelatedWork[];
};

type Experience = {
  company: string;
  role: string;
  dates: string;
  highlights: string[];
};

type RecoveryBoundaryProps = {
  children: ReactNode;
  decorative?: boolean;
};

type RecoveryBoundaryState = {
  hasError: boolean;
  refreshQueued: boolean;
};

const editorialEase: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

const loadParticlesEngine = async (engine: Engine) => {
  await loadSlim(engine);
};

const links = {
  github: "https://github.com/vbnovikov",
  linkedin: "https://www.linkedin.com/in/vladimirbelsch/",
  email: "mailto:belschvladimir@gmail.com",
  pathflow: "https://getpathflow.com",
};

const pathflowScope = [
  "Multi-tenant platform",
  "Client / consultant roles",
  "Architecture workflows",
  "Requests and handoffs",
  "Resources and integrations",
  "MCP / agent workflows",
  "Cloud deployment",
  "Operational ownership",
];

const projects: Project[] = [
  {
    category: "Infrastructure",
    title: "AWS Container Deployment",
    summary:
      "AWS deployment pattern using GitHub OIDC, immutable ECR images, Systems Manager, Docker Compose, and runtime secret separation.",
    href: "https://github.com/vbnovikov/aws-container-deployment-reference",
    tags: ["AWS", "Terraform", "GitHub Actions", "Docker", "SSM"],
  },
  {
    category: "Integration",
    title: "SaaS Integration",
    summary:
      "Multi-tenant integration work covering OAuth, encrypted credentials, signed webhooks, idempotency, and resilient API workflows.",
    href: "https://github.com/vbnovikov/saas-integration-reference",
    tags: ["OAuth", "Webhooks", "PostgreSQL", "Multi-tenancy", "Idempotency"],
  },
  {
    category: "Event Processing",
    title: "Gmail Pub/Sub Document Ingestion",
    summary:
      "Event-driven Gmail ingestion with Pub/Sub authentication, attachment deduplication, tenant-aware identity resolution, and review routing.",
    href: "https://github.com/vbnovikov/gmail-pubsub-document-ingestion-reference",
    tags: ["Gmail", "Pub/Sub", "JWT", "Deduplication", "Review routing"],
  },
  {
    category: "Workflow",
    title: "Customer Intake Workflow",
    summary:
      "Customer intake workflow with server-side validation, idempotent submission, audit trails, notification outbox, and tenant isolation.",
    href: "https://github.com/vbnovikov/customer-intake-workflow-reference",
    tags: ["Validation", "Idempotency", "Audit", "Outbox", "Tenant isolation"],
  },
];

const capabilityGroups: CapabilityGroup[] = [
  {
    detail: {
      eyebrow: "Solutions",
      title: "Customer-facing software work, carried into technical delivery.",
      paragraphs: [
        "I have worked in customer-facing software roles since 2019, beginning in SaaS sales at Seequent and continuing through Circuit Stream, Poka, VelocityEHS, and Cashly.",
        "Across those roles, I have handled discovery, product demonstrations, workshops, requirements gathering, stakeholder communication, and deal progression. At Cashly, that work became more technical: I worked directly with users and business stakeholders to understand operational problems, translate requirements into solutions, troubleshoot production issues, and shape implementations across CRM, telephony, automation, APIs, and cloud infrastructure.",
        "My strongest work sits between the customer problem and the implementation: understanding what needs to change, explaining tradeoffs clearly, and carrying the solution through delivery.",
      ],
      metadata:
        "Since 2019 · B2B SaaS · Discovery · Demos · Workshops · Requirements · Implementation · Troubleshooting",
      relatedProjects: [
        {
          category: "Integration",
          href: "https://github.com/vbnovikov/saas-integration-reference",
          summary: "OAuth, webhooks, encrypted credentials, multi-tenancy, and resilient integration patterns.",
          title: "SaaS Integration Reference",
        },
        {
          category: "Workflow",
          href: "https://github.com/vbnovikov/customer-intake-workflow-reference",
          summary:
            "Customer-facing workflow design with validation, idempotent submission, auditability, and reviewer handoff.",
          title: "Customer Intake Workflow Reference",
        },
      ],
    },
    description: "Discovery, demos, and customer-facing delivery",
    id: "solutions",
    title: "Solutions",
    items: [
      "Technical discovery",
      "Product demos",
      "Requirements translation",
      "Solution design",
      "Stakeholder communication",
      "SaaS implementation",
      "Troubleshooting",
    ],
  },
  {
    detail: {
      eyebrow: "Infrastructure",
      title: "Production infrastructure ownership and operational discipline.",
      paragraphs: [
        "My infrastructure work has focused on building and operating environments that are repeatable, reviewable, and safe to change. I use infrastructure as code to define cloud resources and deployment boundaries rather than relying on manual console configuration, with Terraform as the primary tool for provisioning and documenting AWS infrastructure.",
        "At Cashly, I owned production infrastructure across AWS, including EC2, VPC networking, IAM, container deployment, databases, integrations, and operational troubleshooting. I have also worked with Linux, Docker, Proxmox-based self-hosted environments, and GCP where appropriate.",
        "A recurring focus is reducing operational risk through declarative infrastructure, least-privilege access, secret separation, immutable deployment artifacts, controlled release paths, health checks, and recoverable failure states. The goal is not just to make infrastructure work once, but to make it understandable and reproducible when it changes.",
      ],
      metadata: "Terraform · AWS · IaC · IAM · Networking · Linux · Containers · CI/CD · SSM · Proxmox",
      relatedProjects: [
        {
          category: "Infrastructure",
          href: "https://github.com/vbnovikov/aws-container-deployment-reference",
          summary:
            "Terraform-defined AWS infrastructure with GitHub OIDC, least-privilege IAM, immutable ECR images, SSM deployment, Docker Compose, and runtime secret separation.",
          title: "AWS Container Deployment Reference",
        },
        {
          category: "Cloud / Eventing",
          href: "https://github.com/vbnovikov/gmail-pubsub-document-ingestion-reference",
          summary:
            "Google Pub/Sub, signed push verification, tenant-aware processing, and operationally safe event ingestion.",
          title: "Gmail Pub/Sub Document Ingestion Reference",
        },
      ],
    },
    description: "Cloud, deployment, and operations",
    id: "infrastructure",
    title: "Infrastructure",
    items: ["AWS", "EC2", "VPC", "IAM", "ECR", "SSM", "Docker", "Linux", "Proxmox", "GCP"],
  },
  {
    detail: {
      eyebrow: "Integrations",
      title: "Operational integrations across APIs, events, and customer workflows.",
      paragraphs: [
        "A large part of my technical work has involved connecting systems that were not originally designed to work together: SaaS platforms, telephony providers, CRMs, cloud services, internal applications, and customer workflows.",
        "I have built and operated integrations using REST APIs, OAuth, signed webhooks, Pub/Sub, PostgreSQL/Supabase, Twilio, and n8n. That work has included authentication and token lifecycle, event ingestion, webhook verification, tenant-aware data handling, retry-safe processing, idempotency, and mapping external provider data into internal workflows.",
        "I treat integrations as operational systems rather than one-off API calls. The important part is making them safe to retry, observable when they fail, explicit about trust boundaries, and understandable enough that another person can support or extend them later.",
      ],
      metadata: "REST APIs · OAuth · Webhooks · Pub/Sub · PostgreSQL · Supabase · Twilio · n8n · Idempotency",
      relatedProjects: [
        {
          category: "Integration",
          href: "https://github.com/vbnovikov/saas-integration-reference",
          summary:
            "OAuth, encrypted token storage, signed webhooks, idempotency, multi-tenancy, and resilient API workflows.",
          title: "SaaS Integration Reference",
        },
        {
          category: "Event Processing",
          href: "https://github.com/vbnovikov/gmail-pubsub-document-ingestion-reference",
          summary:
            "Google Pub/Sub ingestion with signed JWT verification, duplicate suppression, tenant-aware identity resolution, and review routing.",
          title: "Gmail Pub/Sub Document Ingestion Reference",
        },
      ],
    },
    description: "APIs, authentication, and event-driven systems",
    id: "integrations",
    title: "Integrations",
    items: ["REST APIs", "OAuth", "Webhooks", "PostgreSQL", "Supabase", "Twilio", "n8n", "Pub/Sub"],
  },
  {
    detail: {
      eyebrow: "Development",
      title: "Application work shaped around delivery and operations.",
      paragraphs: [
        "I use application development as part of delivering and operating technical solutions, rather than as an isolated discipline. Most of my recent work has been in Node.js and TypeScript, with React and Next.js for product interfaces and GitHub Actions for build, test, and deployment workflows.",
        "At Cashly and in related implementation work, I have built application features, API routes, integration services, internal tooling, automation, and deployment workflows around real operational requirements. That has meant working across frontend and backend boundaries, tracing production issues through application and infrastructure layers, and keeping the codebase understandable enough for other engineers to continue the work.",
        "I tend to favor simple, maintainable implementations with clear interfaces, explicit failure states, useful tests, and deployment paths that are easy to inspect and support.",
      ],
      metadata: "Node.js · TypeScript · React · Next.js · APIs · Testing · GitHub Actions · Docker",
      relatedProjects: [
        {
          category: "Application / API",
          href: "https://github.com/vbnovikov/saas-integration-reference",
          summary:
            "TypeScript service implementing OAuth, API clients, encrypted credentials, signed webhooks, multi-tenancy, and retry-safe processing.",
          title: "SaaS Integration Reference",
        },
        {
          category: "Delivery",
          href: "https://github.com/vbnovikov/aws-container-deployment-reference",
          summary:
            "Application build and delivery pipeline using GitHub Actions, Docker, immutable artifacts, and health-gated deployment.",
          title: "AWS Container Deployment Reference",
        },
      ],
    },
    description: "Application and delivery tooling",
    id: "development",
    title: "Development",
    items: ["Node.js", "TypeScript", "React", "Next.js", "GitHub Actions"],
  },
];

const experience: Experience[] = [
  {
    company: "Cashly Inc.",
    role: "Chief Technology Officer",
    dates: "Jan 2024 - Present",
    highlights: [
      "Led delivery and operation of a production SaaS platform spanning CRM, telephony, machine learning, APIs, and cloud infrastructure.",
      "Coordinated a 4-person engineering team and translated business requirements into technical delivery across AWS, PostgreSQL/Supabase, and integrations.",
      "Increased agent productivity from roughly 30 to 200+ calls/day through communications and automation workflows.",
    ],
  },
  {
    company: "Contractor Compliance / VelocityEHS",
    role: "Account Executive",
    dates: "Jul 2023 - Jan 2024",
    highlights: [
      "Handled full-cycle sales for B2B compliance software, including discovery, mid-market demos, pipeline management, and closing.",
    ],
  },
  {
    company: "Poka Inc.",
    role: "Enterprise Account Development Representative",
    dates: "May 2021 - Jan 2023",
    highlights: ["Generated $1.9M in enterprise pipeline and reached 175% quota attainment in Q1 2022."],
  },
  {
    company: "Circuit Stream",
    role: "Sales Lead, AR/VR SaaS",
    dates: "Sep 2020 - Feb 2021",
    highlights: ["Led technical demos and workshops while closing enterprise and public-sector business."],
  },
  {
    company: "Seequent / Bentley Systems",
    role: "Inside Sales Representative",
    dates: "May 2019 - Sep 2020",
    highlights: ["Promoted from BDR and sold geoscience SaaS into mining accounts."],
  },
];

export class AppRecoveryBoundary extends Component<RecoveryBoundaryProps, RecoveryBoundaryState> {
  state: RecoveryBoundaryState = {
    hasError: false,
    refreshQueued: false,
  };

  static getDerivedStateFromError(): RecoveryBoundaryState {
    return {
      hasError: true,
      refreshQueued: false,
    };
  }

  componentDidCatch(error: unknown) {
    this.setState({
      refreshQueued: refreshOnceForStaleModule(error),
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.decorative) {
        return null;
      }

      return (
        <main className="refresh-fallback" role="alert">
          <p className="refresh-kicker">Portfolio refresh</p>
          <h1>{this.state.refreshQueued ? "Refreshing the page." : "The page needs a refresh."}</h1>
          <p>
            {this.state.refreshQueued
              ? "A stale browser module was detected after an update."
              : "The app hit a temporary browser error while loading."}
          </p>
          <button type="button" onClick={() => window.location.reload()}>
            Refresh now
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

function HeroParticles() {
  const prefersReducedMotion = useReducedMotion();
  const particlesMove = useMemo(
    () => ({
      direction: "none" as const,
      enable: !prefersReducedMotion,
      outModes: {
        default: "bounce" as const,
      },
      random: false,
      speed: 0.34,
      straight: false,
    }),
    [prefersReducedMotion],
  );
  const fieldOptions = useMemo<ISourceOptions>(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      detectRetina: true,
      fpsLimit: prefersReducedMotion ? 24 : 60,
      fullScreen: {
        enable: false,
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          onHover: {
            enable: false,
          },
          resize: {
            enable: true,
          },
        },
      },
      particles: {
        color: {
          value: ["#323232", "#575757", "#777777"],
        },
        links: {
          color: "#5f5f5f",
          distance: 132,
          enable: true,
          opacity: 0.2,
          width: 0.9,
        },
        move: particlesMove,
        number: {
          density: {
            enable: true,
            height: 720,
            width: 1200,
          },
          value: 30,
        },
        opacity: {
          value: {
            min: 0.24,
            max: 0.5,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: {
            min: 1.2,
            max: 2.9,
          },
        },
      },
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
    }),
    [particlesMove, prefersReducedMotion],
  );
  const clusterOptions = useMemo<ISourceOptions>(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      detectRetina: true,
      fpsLimit: prefersReducedMotion ? 24 : 60,
      fullScreen: {
        enable: false,
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          onHover: {
            enable: false,
          },
          resize: {
            enable: true,
          },
        },
      },
      particles: {
        color: {
          value: ["#272727", "#4b4b4b", "#315c8a"],
        },
        links: {
          color: "#5a5a5a",
          distance: 108,
          enable: true,
          opacity: 0.24,
          width: 1,
        },
        move: {
          ...particlesMove,
          speed: 0.28,
        },
        number: {
          density: {
            enable: true,
            height: 430,
            width: 520,
          },
          value: 52,
        },
        opacity: {
          value: {
            min: 0.32,
            max: 0.64,
          },
        },
        size: {
          value: {
            min: 1.5,
            max: 3.8,
          },
        },
      },
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
    }),
    [particlesMove, prefersReducedMotion],
  );

  return (
    <AppRecoveryBoundary decorative>
      <ParticlesProvider init={loadParticlesEngine}>
        <Particles className="hero-particles hero-particles-field" id="hero-particles-field" options={fieldOptions} />
        <Particles
          className="hero-particles hero-particles-cluster"
          id="hero-particles-cluster"
          options={clusterOptions}
        />
      </ParticlesProvider>
    </AppRecoveryBoundary>
  );
}

function MotionSection({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      id={id}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      transition={{ duration: 0.52, ease: editorialEase }}
      viewport={{ amount: 0.16, once: true }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
    >
      {children}
    </motion.section>
  );
}

function App() {
  const prefersReducedMotion = useReducedMotion();
  const [activeCapabilityId, setActiveCapabilityId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    const updateHeader = () => {
      root.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeader);
      root.classList.remove("is-scrolled");
    };
  }, []);

  const heroMotion = (delay = 0) => ({
    animate: prefersReducedMotion ? undefined : { opacity: 1, y: 0 },
    initial: prefersReducedMotion ? false : { opacity: 0, y: 8 },
    transition: { delay, duration: 0.48, ease: editorialEase },
  });

  const experienceMotion = {
    initial: prefersReducedMotion ? false : { opacity: 0, y: 8 },
    transition: { duration: 0.48, ease: editorialEase },
    viewport: { amount: 0.2, once: true },
    whileInView: prefersReducedMotion ? undefined : { opacity: 1, y: 0 },
  };

  const projectTitleVariants = prefersReducedMotion
    ? undefined
    : {
        rest: { x: 0 },
        hover: { x: 2, transition: { duration: 0.18, ease: editorialEase } },
      };
  const activeCapability = capabilityGroups.find((group) => group.id === activeCapabilityId && group.detail);
  const activeCapabilityDetail = activeCapability?.detail;
  const activeCapabilityDetailId = activeCapability ? `${activeCapability.id}-detail` : undefined;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="site-header">
        <nav className="nav-shell" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Vladimir Belsch home">
            <span aria-hidden="true">VB</span>
            Vladimir Belsch
          </a>
          <div className="nav-links">
            <a href="#work">Work</a>
            <a href="#product-work">Product</a>
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </nav>
      </header>

      <main id="main">
        <section id="top" className="hero">
          <HeroParticles />
          <div className="section-inner hero-inner">
            <div className="hero-layout">
              <div className="hero-text">
                <motion.p className="hero-role" {...heroMotion(0)}>
                  Solutions engineering / technical operations
                </motion.p>
                <motion.h1 {...heroMotion(0.08)}>Vladimir Belsch</motion.h1>
                <motion.div className="hero-copy" {...heroMotion(0.16)}>
                  <p>I work across SaaS, cloud infrastructure, integrations, and customer delivery.</p>
                  <p>
                    My background combines quota-carrying B2B software sales with hands-on technical
                    leadership building and operating production systems.
                  </p>
                </motion.div>
                <motion.div className="hero-links" aria-label="Primary links" {...heroMotion(0.25)}>
                  <a href="#work">
                    Selected work
                    <ArrowRight aria-hidden="true" className="link-icon" />
                  </a>
                  <a href={links.github} target="_blank" rel="noreferrer">
                    GitHub
                    <ExternalLink aria-hidden="true" className="link-icon" />
                  </a>
                  <a href={links.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                    <ExternalLink aria-hidden="true" className="link-icon" />
                  </a>
                </motion.div>
                <motion.p className="meta-line" {...heroMotion(0.34)}>
                  Open to remote Solutions Engineering, technical consulting, and implementation roles across Canada.
                </motion.p>
              </div>
              <motion.figure className="portrait-frame" {...heroMotion(0.38)}>
                <img src="/images/profile.jpeg" alt="Vladimir Belsch" width="512" height="512" />
              </motion.figure>
            </div>
          </div>
        </section>

        <MotionSection id="work" className="section">
          <div className="section-inner section-grid">
            <div className="section-label" aria-hidden="true">
              01 Work
            </div>
            <div className="section-content">
              <div className="section-intro">
                <h2>Selected systems and integration work.</h2>
                <p>
                  Public projects focused on the practical parts of SaaS delivery: identity,
                  secrets, idempotency, tenant isolation, auditability, and operational handoff.
                </p>
              </div>
              <div className="project-list">
                {projects.map((project, index) => (
                  <motion.a
                    aria-label={`View ${project.title} repository on GitHub`}
                    animate="rest"
                    className={`project-row ${index < 2 ? "project-row-primary" : "project-row-supporting"}`}
                    href={project.href}
                    initial="rest"
                    key={project.title}
                    rel="noreferrer"
                    target="_blank"
                    whileHover={prefersReducedMotion ? undefined : "hover"}
                  >
                    <p className="project-number">{String(index + 1).padStart(2, "0")}</p>
                    <div className="project-main">
                      <motion.h3 variants={projectTitleVariants}>{project.title}</motion.h3>
                      <p>{project.summary}</p>
                      <p className="project-tech">{project.tags.join(" / ")}</p>
                      <span className="inline-link">
                        View repository
                        <ExternalLink aria-hidden="true" className="link-icon" />
                      </span>
                    </div>
                    <p className="project-category">{project.category}</p>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="product-work" className="section product-section">
          <div className="section-inner section-grid">
            <div className="section-label" aria-hidden="true">
              02 Selected Product Work
            </div>
            <div className="section-content">
              <article className="product-feature" aria-labelledby="pathflow-heading">
                <div className="product-story">
                  <div className="product-heading-row">
                    <h2 id="pathflow-heading">Pathflow Systems</h2>
                    <p>Product / Platform</p>
                  </div>
                  <p className="product-positioning">
                    Technical service delivery platform for consultants and clients.
                  </p>
                  <div className="product-copy">
                    <p>
                      Pathflow is a multi-tenant platform I designed and built around real consulting workflows.
                      It brings project context, architecture, requests, handoffs, resources, integrations, and
                      managed technical delivery into one shared client and consultant experience.
                    </p>
                    <p>
                      The work spans product design, application development, authentication and tenancy, integrations,
                      deployment infrastructure, customer-facing implementation, and operational ownership.
                    </p>
                  </div>
                  <a className="inline-link product-link" href={links.pathflow} target="_blank" rel="noreferrer">
                    View Pathflow
                    <ExternalLink aria-hidden="true" className="link-icon" />
                  </a>
                  <p className="product-reference">
                    Selected implementation patterns are published as sanitized{" "}
                    <a href="#work">public reference projects</a> on GitHub.
                  </p>
                </div>
                <aside className="product-scope" aria-labelledby="pathflow-scope-heading">
                  <h3 id="pathflow-scope-heading">Scope</h3>
                  <ul>
                    {pathflowScope.map((scope) => (
                      <li key={scope}>{scope}</li>
                    ))}
                  </ul>
                </aside>
              </article>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="about" className="section">
          <div className="section-inner section-grid">
            <div className="section-label" aria-hidden="true">
              03 About
            </div>
            <div className="section-content prose">
              <h2>Technical operator with a sales foundation.</h2>
              <p>
                I am currently CTO at Cashly Inc., where I own production SaaS delivery across CRM workflows,
                telephony, machine learning, APIs, cloud infrastructure, AWS, PostgreSQL/Supabase, and integrations.
                The role includes coordinating a 4-person engineering team and handling production troubleshooting.
              </p>
              <p>
                Before technical leadership, I worked in B2B SaaS sales across VelocityEHS, Poka,
                Circuit Stream, and Seequent, covering discovery, demos, workshops, pipeline generation,
                and closing. That background helps me translate operational needs into implementation plans.
              </p>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="experience" className="section">
          <div className="section-inner section-grid">
            <div className="section-label" aria-hidden="true">
              04 Experience
            </div>
            <div className="section-content">
              <div className="section-intro">
                <h2>Experience across sales and technical delivery.</h2>
              </div>
              <div className="resume-list">
                {experience.map((item) => (
                  <motion.article className="resume-item" key={`${item.company}-${item.role}`} {...experienceMotion}>
                    <time>{item.dates}</time>
                    <div>
                      <h3>{item.company}</h3>
                      <p className="role">{item.role}</p>
                      <ul>
                        {item.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection className="section">
          <div className="section-inner section-grid">
            <div className="section-label" aria-hidden="true">
              05 Capabilities
            </div>
            <div className="section-content">
              <div className="capability-list">
                {capabilityGroups.map((group) => (
                  <section
                    className={`capability-item ${group.id === activeCapabilityId ? "is-active" : ""}`}
                    key={group.id}
                    aria-labelledby={`${group.id}-heading`}
                  >
                    {group.detail ? (
                      <button
                        aria-controls={`${group.id}-detail`}
                        aria-expanded={group.id === activeCapabilityId}
                        className="capability-trigger"
                        type="button"
                        onClick={() => {
                          setActiveCapabilityId((currentId) => (currentId === group.id ? null : group.id));
                        }}
                      >
                        <span className="capability-heading-row">
                          <span id={`${group.id}-heading`}>{group.title}</span>
                          <ArrowRight aria-hidden="true" className="capability-marker" />
                        </span>
                        <span className="capability-description">{group.description}</span>
                        <span className="capability-skills">{group.items.join(" · ")}</span>
                      </button>
                    ) : (
                      <div className="capability-static">
                        <h3 id={`${group.id}-heading`}>{group.title}</h3>
                        <p className="capability-description">{group.description}</p>
                        <p className="capability-skills">{group.items.join(" · ")}</p>
                      </div>
                    )}
                  </section>
                ))}
              </div>
              <AnimatePresence initial={false}>
                {activeCapability && activeCapabilityDetail && activeCapabilityDetailId ? (
                  <motion.section
                    aria-labelledby={`${activeCapability.id}-detail-heading`}
                    className="capability-detail"
                    id={activeCapabilityDetailId}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                    key={activeCapability.id}
                    transition={{ duration: 0.38, ease: editorialEase }}
                  >
                    <div className="capability-detail-copy">
                      <p className="capability-detail-label">{activeCapabilityDetail.eyebrow}</p>
                      <h3 id={`${activeCapability.id}-detail-heading`}>{activeCapabilityDetail.title}</h3>
                      {activeCapabilityDetail.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    <aside className="capability-related" aria-labelledby={`${activeCapability.id}-related-work`}>
                      <h4 id={`${activeCapability.id}-related-work`}>Related work</h4>
                      <div>
                        {activeCapabilityDetail.relatedProjects.map((work) => (
                          <a href={work.href} key={work.href} rel="noreferrer" target="_blank">
                            <span className="related-category">{work.category}</span>
                            <span className="related-title">
                              {work.title}
                              <ExternalLink aria-hidden="true" className="link-icon" />
                            </span>
                            <span className="related-summary">{work.summary}</span>
                          </a>
                        ))}
                      </div>
                    </aside>
                    <p className="capability-metadata">{activeCapabilityDetail.metadata}</p>
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </MotionSection>

        <MotionSection className="section education-section">
          <div className="section-inner section-grid">
            <div className="section-label" aria-hidden="true">
              06 Education
            </div>
            <div className="section-content education-row">
              <time>2019</time>
              <div className="education-details">
                <img
                  src="/images/western-university-logo.png"
                  alt="Western University logo"
                  width="281"
                  height="300"
                />
                <div>
                  <h2>University of Western Ontario</h2>
                  <p>Economics</p>
                </div>
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="contact" className="section contact-section">
          <div className="section-inner section-grid">
            <div className="section-label" aria-hidden="true">
              07 Contact
            </div>
            <div className="section-content contact-copy">
              <h2>Get in touch</h2>
              <address className="contact-links">
                <a className="contact-email" href={links.email}>
                  belschvladimir@gmail.com
                </a>
                <span>
                  <a href={links.github} target="_blank" rel="noreferrer">
                    GitHub
                    <ExternalLink aria-hidden="true" className="link-icon" />
                  </a>
                  <a href={links.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                    <ExternalLink aria-hidden="true" className="link-icon" />
                  </a>
                </span>
              </address>
              <p>
                Open to remote Solutions Engineering, technical consulting, implementation, and
                related customer-facing technical roles across Canada.
              </p>
            </div>
          </div>
        </MotionSection>
      </main>

      <footer className="site-footer">
        <div className="section-inner footer-inner">
          <p>© 2026 Vladimir Belsch</p>
        </div>
      </footer>
    </>
  );
}

export default App;
