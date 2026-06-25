import type { Meta, StoryObj } from "@storybook/react";

import { LikeButton } from "./LikeButton";

const meta = {
  title: "Blog/LikeButton",
  component: LikeButton,
  args: {
    slug: "storybook-demo",
    initialCount: 42,
  },
} satisfies Meta<typeof LikeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
