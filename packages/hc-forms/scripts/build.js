#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { context } from "esbuild";
import pkg from "../package.json" with { type: "json" };

const program = new Command()
  .description(`Build script for ${pkg.name} - ${pkg.description}`)
  .version(pkg.version)
  .option("-w, --watch", "enable watch mode", false)
  .parse(process.argv);

const { watch } = program.opts();

const ctx = await context({
  entryPoints: ["src/**/*.ts"],
  outdir: "dist",
  outbase: "src",
  sourcemap: watch,
});

if (watch) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
