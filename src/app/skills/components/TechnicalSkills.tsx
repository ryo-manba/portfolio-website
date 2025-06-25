import { databases, frameworks, languages, libraries, tools, uiLibraries } from "@/app/skills/data/skillsData";
import Image from "next/image";
import { memo } from "react";

type SkillData = {
  title: string;
  imagePath: string;
  description?: string;
};

const Skill = memo(function Skill({ title, imagePath }: SkillData) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
      <div className="w-6 h-6 relative flex-shrink-0">
        <Image 
          className="w-full h-full object-contain" 
          src={imagePath} 
          width={24} 
          height={24} 
          alt={`${title}の画像`} 
        />
      </div>
      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        {title}
      </span>
    </div>
  );
});

type SkillSectionProps = {
  title: string;
  data: SkillData[];
  color: string;
};

const SkillSection = memo(function SkillSection({ title, data, color }: SkillSectionProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <h3 className={`text-sm font-semibold mb-2 ${color}`}>{title}</h3>
      <div className="grid grid-cols-1 gap-1">
        {data.map((item) => (
          <Skill key={item.title} title={item.title} imagePath={item.imagePath} />
        ))}
      </div>
    </div>
  );
});

export const TechnicalSkills = memo(function TechnicalSkills() {
  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 justify-items-center">
        <SkillSection title="Languages" data={languages} color="text-blue-600" />
        <SkillSection title="Frameworks" data={frameworks} color="text-green-600" />
        <SkillSection title="Libraries" data={libraries} color="text-purple-600" />
        <SkillSection title="UI Libraries" data={uiLibraries} color="text-pink-600" />
        <SkillSection title="Databases" data={databases} color="text-orange-600" />
        <SkillSection title="Tools" data={tools} color="text-indigo-600" />
      </div>
    </div>
  );
});
