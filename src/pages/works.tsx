import { TitleLayout } from '@/components/Layout/TitleLayout';
import { ProjectCard } from '@/components/ProjectCard';
import type { NextPageWithLayout } from '@/types/NextPageWithLayout';
import { projects } from '@/data/worksData';

const Works: NextPageWithLayout = () => {
  return (
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
  );
};

Works.getLayout = (page) => {
  return <TitleLayout title="Works">{page}</TitleLayout>;
};

export default Works;
