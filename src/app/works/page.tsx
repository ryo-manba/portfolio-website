import { PageTitle } from "@/components/PageTitle";
import { Metadata } from "next";

const title = "プロジェクト一覧 - ryo-manba";
const description = "これまでに作成したプロジェクトの一覧を掲載しています。";

export const metadata: Metadata = {
  title: "Works",
  openGraph: {
    title,
    description,
    url: "/works",
  },
  twitter: {
    title,
    description,
  },
};

type GitHubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  fork: boolean;
};

async function getRepos() {
  const res = await fetch(
    "https://api.github.com/users/ryo-manba/repos?per_page=100&sort=stars&direction=desc",
    { next: { revalidate: 86400 } },
  );
  if (!res.ok) return [];
  const repos: GitHubRepo[] = await res.json();
  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}

const Works = async () => {
  const repos = await getRepos();

  return (
    <>
      <PageTitle title="Works" />
      <div className="max-w-screen-md mx-auto px-4 py-8">
        <ul className="divide-y divide-gray-200">
          {repos.map((repo) => (
            <li key={repo.name} className="py-4">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                    {repo.name}
                  </h2>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4 text-yellow-500"
                    >
                      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                    </svg>
                    {repo.stargazers_count}
                  </span>
                </div>
                {repo.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {repo.description}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Works;
