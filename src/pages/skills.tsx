import type { NextPageWithLayout } from '@/types/NextPageWithLayout';
import { TechnicalSkills } from '@/components/TechnicalSkills';
import { TitleLayout } from '@/components/Layout/TitleLayout';

const Skills: NextPageWithLayout = () => {
  return <TechnicalSkills />;
};

Skills.getLayout = (page) => {
  return (
    <TitleLayout title="Skills" subtitle="Experience Order">
      {page}
    </TitleLayout>
  );
};

export default Skills;
