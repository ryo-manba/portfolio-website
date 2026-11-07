import { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";

const title = "Labs - ryo-manba";
const description = "実験的用のページ";

export const metadata: Metadata = {
  title: "Labs",
  openGraph: {
    title,
    description,
    url: "/labs",
  },
  twitter: {
    title,
    description,
  },
};

const labProjects = [
  {
    slug: "neon-relay",
    title: "Neon Relay — 3D Arena Game",
    date: "2026-11-07",
  },
  {
    slug: "html-in-canvas",
    title: "HTML-in-Canvas Demo",
    date: "2026-11-07",
  },
  {
    slug: "summarizer-api",
    title: "Summarizer API Demo",
    date: "2026-04-01",
  },
  {
    slug: "webnn",
    title: "WebNN API Demo",
    date: "2026-03-07",
  },
  {
    slug: "web-mcp",
    title: "Web MCP Demo",
    date: "2026-03-04",
  },
  {
    slug: "translator-api",
    title: "Translator API Demo",
    date: "2025-11-15",
  },
];

const Labs = () => {
  return (
    <>
      <PageTitle title="Labs" />
      <div style={{ display: "block", maxWidth: "65ch", marginInlineStart: "auto", marginInlineEnd: "auto" }}>
          <ul className="space-y-2">
            {labProjects.map((project) => (
              <li key={project.slug}>
                <Link href={`/labs/${project.slug}`} className="text-blue-600 hover:underline">
                  {project.title}
                </Link>
              </li>
            ))}
          </ul>
      </div>
    </>
  );
};

export default Labs;
