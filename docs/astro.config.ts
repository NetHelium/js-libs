import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [
    starlight({
      title: "Net Hélium Docs",
      favicon: "favicon.jpg",
      logo: {
        light: "./src/assets/logo-light.png",
        dark: "./src/assets/logo-dark.png",
        replacesTitle: true,
      },
      locales: {
        root: {
          label: "Français",
          lang: "fr",
        },
      },
      defaultLocale: "root",
      social: {
        linkedin: "https://fr.linkedin.com/company/net-helium-marketing-relationnel-crm",
        github: "https://github.com/NetHelium",
      },
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Hélium Connect",
          autogenerate: {
            directory: "helium-connect/forms",
          },
        },
      ],
    }),
  ],
  server: {
    port: 4323,
  },
  site: "https://docs.net-helium.fr",
});
