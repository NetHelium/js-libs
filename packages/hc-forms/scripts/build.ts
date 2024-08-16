#!/usr/bin/env -S pnpm tsx

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
  entryPoints: ["src/index.ts"],
  outfile: "dist/hc-forms.min.js",
  bundle: true,
  sourcemap: watch,
  minify: !watch,
});

if (watch) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
