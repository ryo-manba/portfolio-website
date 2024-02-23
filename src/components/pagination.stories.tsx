import type { StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination, type PaginationProps } from "./pagination";

const meta = {
  title: "Pagination",
  component: Pagination,
};

export default meta;
type Story = StoryObj<typeof meta>;

const PaginationExample = ({ currentPage, totalPages }: Partial<PaginationProps>) => {
  const [current, setCurrent] = useState(currentPage as number);
  return <Pagination currentPage={current} totalPages={totalPages as number} onPageChange={setCurrent} />;
};

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
  },
  render: (args) => <PaginationExample {...args} />,
};

// 7 pages or less
export const LessThanSevenPages: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
  },
  render: (args) => <PaginationExample {...args} />,
};

// within the first 4 pages
export const WithinFirstFourPages: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
  },
  render: (args) => <PaginationExample {...args} />,
};

// within the last 4 pages
export const WithinLastFourPages: Story = {
  args: {
    currentPage: 8,
    totalPages: 10,
  },
  render: (args) => <PaginationExample {...args} />,
};

// middle pages
export const MiddlePages: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
  },
  render: (args) => <PaginationExample {...args} />,
};
