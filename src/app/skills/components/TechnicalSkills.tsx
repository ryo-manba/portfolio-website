import { databases, frameworks, languages, libraries, tools, uiLibraries } from "@/app/skills/data/skillsData";
import Image from "next/image";
import { memo } from "react";

type SkillData = {
  title: string;
  imagePath: string;
  description?: string;
};

const Skill = memo(function Skill({ title, imagePath, description = "" }: SkillData) {
  return (
    <div className="p-4 text-gray-900">
      <div className="flex flex-col items-center py-2 mb-2 relative group">
        <div className="w-24 h-24 relative rounded-full bg-gray-100 flex justify-center items-center z-10 transition-transform duration-300 ease-in-out group-hover:-translate-y-1">
          <Image className="w-12 x-10" src={imagePath} width={100} height={100} alt={`${title}の画像`} />
        </div>
        <div className="absolute bottom-0 right-1/2 w-0 h-1 bg-green-500 rounded-l transition-all duration-500 group-hover:w-9" />
        <div className="absolute bottom-0 left-1/2 w-0 h-1 bg-green-500 rounded-r transition-all duration-500 group-hover:w-9" />
        <h3 className="text-gray-900 mt-2">{title}</h3>
      </div>
      <p className="text-base">{description}</p>
    </div>
  );
});

type SkillSectionProps = {
  title: string;
  data: SkillData[];
};

const SkillSection = memo(function SkillSection({ title, data }: SkillSectionProps) {
  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-900 col-span-full">{title}</h2>
      {data.map((item) => (
        <Skill key={item.title} title={item.title} imagePath={item.imagePath} />
      ))}
    </>
  );
});

export const TechnicalSkills = memo(function TechnicalSkills() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 justify-items-center items-center text-center gap-4 p-10 text-xl max-w-6xl mx-auto">
      <SkillSection title="Languages" data={languages} />
      <SkillSection title="Frameworks" data={frameworks} />
      <SkillSection title="Libraries" data={libraries} />
      <SkillSection title="Ui Libraries" data={uiLibraries} />
      <SkillSection title="Databases" data={databases} />
      <SkillSection title="Tools" data={tools} />
    </div>
  );
});
