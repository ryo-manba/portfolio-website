import type { NextPageWithLayout } from '@/types/NextPageWithLayout';
import { TechnicalSkills } from '@/components/TechnicalSkills';
import { TitleLayout } from '@/components/Layout/TitleLayout';
import { useTitle } from '@/hooks/useTitle';

const PAGE_TITLE = 'Skills';

const Skills: NextPageWithLayout = () => {
  useTitle(PAGE_TITLE);
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
