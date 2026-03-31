import { skillCategories } from "@/app/skills/data/skillsData";
import type { SkillData, SkillCategory } from "@/app/skills/data/skillsData";
import Image from "next/image";
import { memo } from "react";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-px">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill={star <= rating ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1}
        className={`w-3 h-3 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
      </svg>
    ))}
  </div>
);

const Skill = memo(function Skill({ title, imagePath, rating }: SkillData) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="w-5 h-5 relative flex-shrink-0">
        <Image
          className="w-full h-full object-contain"
          src={imagePath}
          width={20}
          height={20}
          alt={`${title}の画像`}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
        {title}
      </span>
      <div className="flex-shrink-0 ml-auto">
        <StarRating rating={rating} />
      </div>
    </div>
  );
});

const SkillList = ({ data }: { data: SkillData[] }) => (
  <div className="flex flex-wrap gap-2">
    {data.map((item) => (
      <Skill key={item.title} {...item} />
    ))}
  </div>
);

const SkillSection = memo(function SkillSection({ title, color, data, subCategories }: SkillCategory) {
  return (
    <div>
      <h3 className={`text-lg font-semibold mb-3 ${color}`}>{title}</h3>
      {subCategories ? (
        <div className="space-y-4">
          {subCategories.map((sub) => (
            <div key={sub.label}>
              <h4 className="text-xs text-gray-400 font-medium mb-2">{sub.label}</h4>
              <SkillList data={sub.data} />
            </div>
          ))}
        </div>
      ) : (
        data && <SkillList data={data} />
      )}
    </div>
  );
});

export const TechnicalSkills = memo(function TechnicalSkills() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {skillCategories.map((category) => (
        <SkillSection key={category.title} {...category} />
      ))}
    </div>
  );
});
