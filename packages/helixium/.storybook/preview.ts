import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/web-components-vite";
import "../src/themes/teal.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      disable: true,
    },
    a11y: {
      test: "todo",
    },
  },
  globalTypes: {
    locale: {
      description: "Internationalization",
      toolbar: {
        icon: "globe",
        items: [
          {
            title: "English",
            value: "en",
            right: "🇺🇸",
          },
          {
            title: "Français",
            value: "fr",
            right: "🇫🇷",
          },
        ],
      },
    },
  },
  initialGlobals: {
    locale: "en",
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light-theme",
        dark: "dark-theme",
      },
      defaultTheme: "light",
    }),
    (story, ctx) => {
      document.documentElement.lang = ctx.globals.locale;
      return story();
    },
  ],
};

export default preview;
