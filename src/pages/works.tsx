import { TitleLayout } from '@/components/Layout/TitleLayout';
import { ProjectCard } from '@/components/ProjectCard';
import type { NextPageWithLayout } from '@/types/NextPageWithLayout';
import { projects } from '@/data/worksData';
import { useTitle } from '@/hooks/useTitle';
import { Meta } from '@/components/Meta';

const PAGE_TITLE = 'Works';

const Works: NextPageWithLayout = () => {
  useTitle(PAGE_TITLE);

  return (
    <>
      <Meta
        title="プロジェクト一覧 - ryo-manba"
        description="これまでに作成したプロジェクトの一覧が表示されます。"
      />
      <div className="flex justify-center my-8 mx-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 sm:gap-x-8 sm:gap-y-10">
          {projects.map((project) => (
            <ProjectCard
              key={project.projectTitle}
              projectTitle={project.projectTitle}
              projectLink={project.projectLink}
              description={project.description}
              imagePath={project.imagePath}
              tags={project.tags}
            />
          ))}
        </div>
      </div>
    </>
  );
};

Works.getLayout = (page) => {
  return <TitleLayout title="Works">{page}</TitleLayout>;
};

export default Works;
