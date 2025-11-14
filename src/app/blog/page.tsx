import { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { getBlogPosts } from "./utils/getBlogPosts";

const pageTitle = "Blog";
const title = "ブログ - ryo-manba";
const description = "技術記事やその他の記事を掲載しています。";

export const metadata: Metadata = {
  title: pageTitle,
  openGraph: {
    title,
    description,
    url: "/blog",
  },
  twitter: {
    title,
    description,
  },
};

const Blog = () => {
  const posts = getBlogPosts();

  const postsByYear = posts.reduce(
    (acc, post) => {
      const year = new Date(post.date).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    },
    {} as Record<number, typeof posts>,
  );

  const years = Object.keys(postsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      <PageTitle title="Blog" />
      <div style={{ display: "block", maxWidth: "65ch", marginInlineStart: "auto", marginInlineEnd: "auto" }}>
        {posts.length === 0 ? (
          <p className="text-center text-xl font-semibold">まだ記事がありません。</p>
        ) : (
          <div className="space-y-8">
            {years.map((year) => (
              <div key={year}>
                <h2 className="text-2xl font-bold mb-4">{year}</h2>
                <ul className="space-y-2">
                  {postsByYear[year].map((post) => {
                    const date = new Date(post.date);
                    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                    return (
                      <li key={post.slug} className="flex gap-4">
                        <span className="text-gray-600 flex-shrink-0">{formattedDate}</span>
                        <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
                          {post.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;
