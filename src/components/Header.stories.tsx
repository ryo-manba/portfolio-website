import type { StoryObj } from "@storybook/react";

import { Header } from "./Header";

const meta = {
  title: "Header",
  component: Header,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
