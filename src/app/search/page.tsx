import { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { getBlogPosts } from "@/app/blog/utils/getBlogPosts";
import { projects } from "@/app/works/data/worksData";

export const metadata: Metadata = {
  title: "検索結果",
};

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <>
        <PageTitle title="検索" />
        <div style={{ maxWidth: "65ch", marginInline: "auto" }}>
          <p>検索キーワードを入力してください。</p>
        </div>
      </>
    );
  }

  const blogPosts = getBlogPosts().filter(
    (post) =>
      matchesQuery(post.title, query) ||
      matchesQuery(post.description, query) ||
      (post.tags ?? []).some((tag) => matchesQuery(tag, query)),
  );

  const matchedProjects = projects.filter(
    (project) =>
      matchesQuery(project.projectTitle, query) ||
      matchesQuery(project.description, query) ||
      project.tags.some((tag) => matchesQuery(tag, query)),
  );

  const hasResults = blogPosts.length > 0 || matchedProjects.length > 0;

  return (
    <>
      <PageTitle title={`「${query}」の検索結果`} />
      <div style={{ maxWidth: "65ch", marginInline: "auto", paddingInline: "1rem" }}>
        {!hasResults && <p>該当する結果が見つかりませんでした。</p>}

        {blogPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">ブログ記事</h2>
            <ul className="space-y-4 mb-8">
              {blogPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline text-lg">
                    {post.title}
                  </Link>
                  {post.description && (
                    <p className="text-sm text-gray-600 mt-1">{post.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {matchedProjects.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">プロジェクト</h2>
            <ul className="space-y-4">
              {matchedProjects.map((project) => (
                <li key={project.projectTitle}>
                  <a
                    href={project.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-lg"
                  >
                    {project.projectTitle}
                  </a>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
