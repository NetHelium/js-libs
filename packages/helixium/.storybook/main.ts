import type { StorybookConfig } from "@storybook/web-components-vite";

const config = {
  stories: ["../src/**/*.stories.ts"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-themes"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
} satisfies StorybookConfig;

export default config;
