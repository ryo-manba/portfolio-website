import type { StoryObj } from "@storybook/react";

import { Avatar } from "./avatar";

const meta = {
  title: "Avatar",
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
