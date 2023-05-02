import { memo } from 'react';
import Image from 'next/image';
import { Tag } from '@/components/Tag';

export type Project = {
  projectTitle: string;
  projectLink: string;
  description: string;
  imagePath: string;
  tags: string[];
};

export const ProjectCard = memo(function ProjectCard({
  projectTitle,
  projectLink,
  description,
  imagePath,
  tags,
}: Project) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-400 bg-[#F1F1F1] sm:w-96">
      <div className="aspect-w-4 aspect-h-4 sm:aspect-none bg-gray-200 group-hover:opacity-75 sm:h-64">
        <Image
          className="h-full w-full object-cover object-center sm:h-full sm:w-full"
          src={imagePath}
          alt={description}
          width={500}
          height={500}
        />
      </div>
      <div className="flex flex-1 flex-col p-4 group-hover:bg-gray-800">
        <h3 className="text-sm font-medium text-black group-hover:text-[#555]">
          <a
            href={projectLink}
            target="_blank"
            rel="noopener nofollow noreferrer"
          >
            <span aria-hidden="true" className="absolute inset-0"></span>
            {projectTitle}
          </a>
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-black group-hover:text-[#555]">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap">
          {tags.map((tag, index) => (
            <Tag key={index} label={tag} />
          ))}
        </div>
      </div>
    </div>
  );
});
