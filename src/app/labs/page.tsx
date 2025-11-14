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
