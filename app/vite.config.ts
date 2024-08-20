import { resolve } from "node:path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  resolve: {
    alias: {
      $root: resolve(__dirname, "./src"),
      $assets: resolve(__dirname, "./src/assets"),
      $components: resolve(__dirname, "./src/components"),
      $pages: resolve(__dirname, "./src/pages"),
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@shoelace-style/shoelace/dist/themes/*.css",
          dest: "shoelace/themes",
        },
        {
          src: "node_modules/@shoelace-style/shoelace/dist/assets/icons/*.svg",
          dest: "shoelace/assets/icons",
        },
      ],
    }),
  ],
});
