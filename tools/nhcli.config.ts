import { defineConfig } from "./src/utils";

export default defineConfig({
  build: {
    globEntryPoints: ["src/!(cli)/**/*.ts"],
    outdir: "dist",
    target: "esnext",
    bundle: true,
    platform: "node",
    format: "esm",
    splitting: true,
    chunkNames: "chunks/[name].[hash]",
    packages: "external",
    tsconfig: "tsconfig.build.json",
  },
});
