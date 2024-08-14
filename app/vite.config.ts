import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
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
