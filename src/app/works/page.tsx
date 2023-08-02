import { Metadata } from 'next';
import { ProjectCard } from '@/app/works/components/ProjectCard';
import { projects } from '@/app/works/data/worksData';
import { PageTitle } from '@/components/PageTitle';

const title = 'プロジェクト一覧 - ryo-manba';
const description = 'これまでに作成したプロジェクトの一覧を掲載しています。';

export const metadata: Metadata = {
  title: 'Works',
  openGraph: {
    title,
    description,
    url: '/works',
  },
  twitter: {
    title,
    description,
  },
};

const Works = () => {
  return (
    <>
      <PageTitle title="Works" />
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

export default Works;
