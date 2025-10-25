import { PageTitle } from "@/components/PageTitle";
import { Metadata } from "next";
import Link from "next/link";

const title = "Labs - ryo-manba";
const description = "実験的なプロジェクトや技術検証を掲載しています。";

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

const labItems = [
  {
    title: "View Transition API Demo",
    description:
      "ブラウザネイティブのView Transition APIを使用したスムーズな画面遷移のデモです。",
    href: "/labs/view-transition",
    tags: ["CSS", "Web API", "Animation"],
  },
];

const Labs = () => {
  return (
    <>
      <PageTitle title="Labs" />
      <div className="flex justify-center my-8 mx-2">
        <div className="max-w-4xl w-full px-4">
          <p className="text-lg mb-6">
            実験的なプロジェクトや技術検証の場です。
          </p>
          <div className="grid grid-cols-1 gap-6">
            {labItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow block"
              >
                <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                <p className="text-gray-600 mb-3">{item.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Labs;
