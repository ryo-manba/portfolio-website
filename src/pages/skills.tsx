import { TechnicalSkills } from '../components/TechnicalSkills/TechnicalSkills';
import type { NextPageWithLayout } from '../types/NextPageWithLayout';
import { TitleLayout } from '../components/Layout/TitleLayout';

const Skills: NextPageWithLayout = () => {
  return <TechnicalSkills />;
};

Skills.getLayout = (page) => {
  return (
    <TitleLayout title="Skills & Abilities" subtitle="Experience Order">
      {page}
    </TitleLayout>
  );
};

export default Skills;
