import { BlogPostCard } from "@/app/blog/components/BlogPostCard";
import { getBlogPosts } from "@/app/blog/utils/getBlogPosts";
import { Avatar } from "@/components/Avatar";
import Link from "next/link";
import { Links } from "./links";

const labProjects = [
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

const SectionHeader = ({
  title,
  href,
}: {
  title: string;
  href: string;
}) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl font-bold">{title}</h2>
    <Link href={href} className="text-blue-500 hover:text-blue-700 font-medium text-sm">
      View all →
    </Link>
  </div>
);

const Home = () => {
  const recentPosts = getBlogPosts().slice(0, 3);
  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col justify-center items-center px-3 max-w-screen-lg mx-auto py-20">
        <div className="flex flex-col items-center md:flex-row md:gap-x-16 md:justify-between justify-center">
          <div className="text-center md:text-start">
            <h1 className="font-bold text-3xl">
              Hi there 👋
              <br />
              I&#x27;m Ryo Matsukawa
            </h1>
            <Links />
          </div>
          <Avatar />
        </div>
      </section>

      {/* Blog */}
      <section className="px-3 max-w-screen-lg mx-auto py-16">
        <SectionHeader title="Blog" href="/blog" />
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Labs */}
      <section className="px-3 max-w-screen-lg mx-auto py-16">
        <SectionHeader title="Labs" href="/labs" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {labProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/labs/${project.slug}`}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">{project.title}</h3>
              <time className="text-sm text-gray-600 mt-2 block">
                {new Date(project.date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
