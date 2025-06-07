import { type BuildOptions, build, context } from "esbuild";
import { minifyHTMLLiteralsPlugin } from "esbuild-plugin-minify-html-literals";
import { globby } from "globby";
import { TscWatchClient } from "tsc-watch";
import { getRootBinPath, streamCmd } from "../../utils";
import { printBanner, printError, printNewLine } from "../messages";

export type BuildRunnerOptions = BuildOptions & {
  /**
   * Entry points as globs if applicable. This option is similar to the `entryPoints` option
   * provided by esbuild except this one adds support for glob patterns.
   *
   * @default []
   */
  globEntryPoints: string[];

  /**
   * The TypeScript configuration to use for the build. The path is relative to the project's root
   * directory.
   *
   * @default "./tsconfig.json"
   */
  tsconfig: string;

  /**
   * Wether the build should be done in watch mode or not (useful while in development).
   *
   * @default false
   */
  watch: boolean;
};

const outDir = ({ outdir, outfile }: BuildOptions) => {
  let dir: string | undefined;

  for (const option of [outdir, outfile]) {
    if (!option) continue;
    dir = option.split("/").filter((x) => !/^\.+$/.test(x))[0];
  }

  return dir || "dist";
};

export default async (options: BuildRunnerOptions) => {
  const bannerMessage = options.watch ? "Build in watch mode" : "Build";
  const tsc = await getRootBinPath("tsc");

  if (!tsc) {
    const errorMessages = [
      "The TypeScript compiler (tsc) could not be found!",
      "Make sure typescript is installed in the root project.",
    ];

    return await printError(errorMessages.join("\n"), { bannerText: bannerMessage });
  }

  const { globEntryPoints, tsconfig, watch, ...esbuildOptions } = options;
  const tscArgs = ["-p", tsconfig];
  let entryPoints = esbuildOptions.entryPoints as string[] | undefined;

  if (globEntryPoints.length > 0) {
    if (!entryPoints) entryPoints = [];

    for (const globEntryPoint of globEntryPoints) {
      entryPoints.push(...(await globby(globEntryPoint)));
    }
  }

  const esbuildConfig: BuildOptions = {
    ...esbuildOptions,
    logLevel: "info",
    tsconfig,
    entryPoints,
    plugins: [minifyHTMLLiteralsPlugin()],
  };

  await printBanner(bannerMessage);
  streamCmd("rm", ["-rf", `./${outDir(esbuildConfig)}`]);

  if (watch) {
    // Build the type definitions in watch mode
    new TscWatchClient().start(...tscArgs);

    // Build the JavaScript bundle(s) in watch mode
    (await context(esbuildConfig)).watch();
  } else {
    // Build the type definitions
    const tscProcess = streamCmd(tsc, tscArgs);

    // Build the JavaScript bundle(s)
    await build(esbuildConfig);

    printNewLine();
    return tscProcess;
  }
};
