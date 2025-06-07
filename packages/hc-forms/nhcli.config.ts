import { defineConfig } from "@net-helium/tools";

export default defineConfig({
  test: {
    regular: {
      environment: "jsdom",
    },
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
