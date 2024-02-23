import type { StoryObj } from "@storybook/react";

import { Header } from "./header";

const meta = {
  title: "Header",
  component: Header,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
