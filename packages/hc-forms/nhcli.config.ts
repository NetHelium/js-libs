import { defineConfig } from "@net-helium/tools/utils";

export default defineConfig({
  test: {
    config: "jsdom",
  },
  build: {
    entryPoints: ["src/index.ts"],
    outfile: "dist/hc-forms.js",
    target: "es2023",
    bundle: true,
    sourcemap: false,
    minify: true,
    legalComments: "none",
    tsconfig: "tsconfig.build.json",
  },
});
