import Link from "next/link";
import { BlogPostMetadata } from "../types";

type BlogPostCardProps = {
  post: BlogPostMetadata;
};

export const BlogPostCard = ({ post }: BlogPostCardProps) => {
  const formattedDate = new Date(post.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <Link
        href={`/blog/${post.slug}`}
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-50 rounded"
      >
        <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h2>
        <time className="text-sm text-gray-600 mb-3 block">{formattedDate}</time>
        {post.description && <p className="text-gray-700 mb-4">{post.description}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
};
