import type { StoryObj } from "@storybook/react";

import { Footer } from "./Footer";

const meta = {
  title: "Footer",
  component: Footer,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
