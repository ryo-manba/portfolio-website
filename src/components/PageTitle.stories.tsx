import type { StoryObj } from "@storybook/react";

import { PageTitle } from "./PageTitle";

const meta = {
  title: "PageTitle",
  component: PageTitle,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "PageTitle",
    subtitle: "Subtitle",
  },
};
