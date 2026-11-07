import type { Preview } from "@storybook/react";
import '../src/styles/globals.css';

const customViewports = {
  mobile1: {
    name: "Mobile (small)",
    styles: { width: "320px", height: "568px" },
    type: "mobile",
  },
  mobile2: {
    name: "Mobile (large)",
    styles: { width: "414px", height: "896px" },
    type: "mobile",
  },
  tablet: {
    name: "Tablet",
    styles: { width: "834px", height: "1112px" },
    type: "tablet",
  },
  desktop: {
    name: "Desktop",
    styles: { width: "1280px", height: "800px" },
    type: "desktop",
  },
} as const;

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: customViewports,
    },
  },
};

export default preview;
