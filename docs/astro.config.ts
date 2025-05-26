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
      social: [
        {
          icon: "linkedin",
          label: "LinkedIn",
          href: "https://fr.linkedin.com/company/net-helium-marketing-relationnel-crm",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/NetHelium",
        },
      ],
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Helium Connect",
          autogenerate: {
            directory: "helium-connect/forms",
          },
        },
        {
          label: "Tracking HCT",
          autogenerate: {
            directory: "hct-tracking",
          },
        },
      ],
    }),
  ],
  prefetch: {
    prefetchAll: true,
  },
  server: {
    port: 4323,
  },
  site: "https://docs.net-helium.fr",
});
