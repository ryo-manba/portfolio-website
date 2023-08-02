import { Metadata } from 'next';
import { PageTitle } from '@/components/PageTitle';
import { TechnicalSkills } from '@/app/skills/components/TechnicalSkills';

const title = '技術スタック - ryo-manba';
const description = '経験したことがある技術スタックを掲載しています。';

export const metadata: Metadata = {
  title: 'Skills',
  openGraph: {
    title,
    description,
    url: '/skills',
  },
  twitter: {
    title,
    description,
  },
};

const Skills = () => {
  return (
    <>
      <PageTitle title="Skills" subtitle="Experience Order" />
      <TechnicalSkills />
    </>
  );
};

export default Skills;
