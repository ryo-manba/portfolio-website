import { memo } from 'react';
import Image from 'next/image';

type Props = {
  siteName: string;
  logoUrl: string;
  title: string;
  link: string;
  createdAt: string;
};

export const BlogCard = memo(function BlogCard({
  siteName,
  logoUrl,
  title,
  link,
  createdAt,
}: Props) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-400 bg-gray-200 hover:bg-gray-300 md:w-96 md:mx-2 mx-8">
      <div className="flex items-center p-4">
        {logoUrl && (
          <div className="w-5 h-5 mr-3">
            <Image src={logoUrl} alt={siteName} width={40} height={40} />
          </div>
        )}
        <h4 className="text-xs font-medium text-gray-600">{siteName}</h4>
      </div>
      <div className="px-6 pb-10">
        <h3 className="text-xl font-medium text-gray-900">
          <a href={link} target="_blank" rel="noreferrer">
            <span aria-hidden="true" className="absolute inset-0"></span>
            {title}
          </a>
        </h3>
        <p className="absolute right-3 bottom-2 text-sm text-gray-700">
          {createdAt}
        </p>
      </div>
    </div>
  );
});
