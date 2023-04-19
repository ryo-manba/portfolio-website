import { ProjectCard } from '../components/ProjectCard/ProjectCard';

const SAMPLE_TITLE = 'Example';
const SAMPLE_TEXT =
  '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれ';
const SAMPLE_URL = 'https://example.com/';
const SAMPLE_IMAGE = '/images/github-mark.png';
const SAMPLE_TAGS = ['TypeScript', 'React', 'Next.js'];

const Works = () => {
  return (
    <div className="mt-12">
      <h1 className="text-center text-4xl font-bold mb-5">Works</h1>
      <div className="flex justify-center my-8 mx-44">
        <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8">
          <ProjectCard
            projectTitle={SAMPLE_TITLE}
            projectLink={SAMPLE_URL}
            description={SAMPLE_TEXT}
            imagePath={SAMPLE_IMAGE}
            tags={SAMPLE_TAGS}
          />
          <ProjectCard
            projectTitle={SAMPLE_TITLE}
            projectLink={SAMPLE_URL}
            description={SAMPLE_TEXT}
            imagePath={SAMPLE_IMAGE}
            tags={SAMPLE_TAGS}
          />
          <ProjectCard
            projectTitle={SAMPLE_TITLE}
            projectLink={SAMPLE_URL}
            description={SAMPLE_TEXT}
            imagePath={SAMPLE_IMAGE}
            tags={SAMPLE_TAGS}
          />
          <ProjectCard
            projectTitle={SAMPLE_TITLE}
            projectLink={SAMPLE_URL}
            description={SAMPLE_TEXT}
            imagePath={SAMPLE_IMAGE}
            tags={SAMPLE_TAGS}
          />
        </div>
      </div>
    </div>
  );
};

export default Works;
