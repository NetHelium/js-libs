#!/usr/bin/env -S pnpm tsx

import { Command } from "@commander-js/extra-typings";
import { context } from "esbuild";

const program = new Command()
  .description("Build script for the the development app")
  .option("-w, --watch", "enable watch mode", false)
  .parse(process.argv);

const { watch } = program.opts();

const ctx = await context({
  entryPoints: ["public/ts/**/*.ts"],
  outdir: "public/js",
  target: "es2022",
  format: "esm",
  bundle: true,
  splitting: true,
  chunkNames: "chunks/[name]-[hash]",
});

if (watch) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
