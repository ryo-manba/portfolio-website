import { memo } from 'react';
type Props = {
  label: string;
};

// TODO: Tagのバリデーション
export const Tag = memo(function Tag({ label }: Props) {
  return (
    <span className="m-1 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-[#D9D9D9] text-[#4B4B4B]">
      {label}
    </span>
  );
});
