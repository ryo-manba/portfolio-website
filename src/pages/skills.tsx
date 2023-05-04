import type { NextPageWithLayout } from '@/types/NextPageWithLayout';
import { TechnicalSkills } from '@/components/TechnicalSkills';
import { TitleLayout } from '@/components/Layout/TitleLayout';
import { useTitle } from '@/hooks/useTitle';
import { Meta } from '@/components/Meta';

const PAGE_TITLE = 'Skills';

const Skills: NextPageWithLayout = () => {
  useTitle(PAGE_TITLE);
  return (
    <>
      <Meta
        title="技術スタック - ryo-manba"
        description="経験したことがある技術スタックを表示しています。"
      />
      <TechnicalSkills />
    </>
  );
};

Skills.getLayout = (page) => {
  return (
    <TitleLayout title="Skills" subtitle="Experience Order">
      {page}
    </TitleLayout>
  );
};

export default Skills;
