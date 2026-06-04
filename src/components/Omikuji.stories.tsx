import type { StoryObj } from "@storybook/react";

import { Omikuji } from "./Omikuji";

const meta = {
  title: "Omikuji",
  component: Omikuji,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
