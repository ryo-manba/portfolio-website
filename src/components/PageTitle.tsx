import { memo } from "react";

type Props = {
  title: string;
  subtitle?: string;
};

export const PageTitle = memo(function PageTitle({ title, subtitle }: Props) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-semibold">{title}</h1>
      {subtitle && <p className="text-xl ">({subtitle})</p>}
    </div>
  );
});
