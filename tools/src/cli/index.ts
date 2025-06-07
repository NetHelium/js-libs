import type { ChildProcess } from "node:child_process";
import path from "node:path";
import arg from "arg";
import { build } from "esbuild";
import { type NhCliOptions, defineConfig } from "../";
import { cmd, pathExists } from "../utils";
import {
  type TestRunnerOptions,
  browsers as availableBrowsers,
  environments as availableEnvironments,
  buildRunner,
  devRunner,
  packRunner,
  testRunner,
  tsCheckRunner,
} from "./runners";

const configFile = path.resolve(process.cwd(), "nhcli.config.ts");
let cliOptions: NhCliOptions;

/**
 * If the project has a configuration file (`nhcli.config.ts`) for the CLI, we transpile and load
 * it on the fly. Otherwise, we load the default configuration.
 */
if (await pathExists(configFile)) {
  const jsConfig = path.resolve(path.dirname(configFile), ".nh/nhcli.config.js");

  await build({
    entryPoints: [configFile],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: jsConfig,
  });

  cliOptions = await import(jsConfig).then(
    ({ default: config }: { default: NhCliOptions }) => config,
  );

  await cmd("rm", [jsConfig]);
} else {
  cliOptions = defineConfig();
}

/**
 * Command-line options of the CLI. These options will have the priority over the project's
 * configuration file.
 */
const args = arg({
  /**
   * Enable browser tests.
   */
  "--browser": Boolean,

  /**
   * List of browser engines to use when running browser tests. The engines should be separated by
   * a comma.
   *
   * @example --browsers=chromium,firefox,webkit
   */
  "--browsers": String,

  /**
   * Enable tests coverage. Details of the coverage will be accessible in the web interface when
   * used with the `--ui` option.
   */
  "--coverage": Boolean,

  /**
   * Default environment for regular tests. Choose between `node` or `jsdom`.
   *
   * @example --env=jsdom
   */
  "--env": String,

  /**
   * Run the browser tests in headless mode (without the browser's ui) which is useful for CI.
   */
  "--headless": Boolean,

  /**
   * Enable regular tests.
   */
  "--regular": Boolean,

  /**
   * Use the restore mode in the packing process.
   */
  "--restore": Boolean,

  /**
   * The TypeScript configuration to use while transpiling during tests execution.
   */
  "--tsconfig": String,

  /**
   * Enable the UI mode to visualize the test results in a web interface.
   */
  "--ui": Boolean,

  /**
   * Run the tests in watch mode which is useful while in development.
   */
  "--watch": Boolean,

  // Aliases
  "-b": "--browser",
  "-c": "--coverage",
  "-e": "--env",
  "-r": "--regular",
  "-t": "--tsconfig",
  "-w": "--watch",
});

let childProcess: ChildProcess | undefined = undefined;

/**
 * TypeScript check runner.
 */
if (args._.includes("tscheck")) {
  const tsCheckProcess = await tsCheckRunner({
    tsconfig: args["--tsconfig"] || cliOptions.check.tsconfig,
  });

  if (tsCheckProcess) childProcess = tsCheckProcess;
}

/**
 * Development runner.
 */
if (args._.includes("dev")) {
  await devRunner();
}

/**
 * Tests runner for `node`, `jsdom` and `browser` test files.
 */
if (args._.includes("test")) {
  const isValidEnv = (
    environment: string,
  ): environment is TestRunnerOptions["regular"]["environment"] =>
    availableEnvironments.includes(environment as TestRunnerOptions["regular"]["environment"]);

  const isValidBrowserList = (
    browsers: string[],
  ): browsers is TestRunnerOptions["browser"]["browsers"] =>
    browsers.every((browser) =>
      availableBrowsers.includes(browser as TestRunnerOptions["browser"]["browsers"][number]),
    );

  const environment = args["--env"] || cliOptions.test.regular.environment;
  const browsers = args["--browsers"]?.split(",") || cliOptions.test.browser.browsers;

  await testRunner({
    tsconfig: args["--tsconfig"] || cliOptions.test.tsconfig,
    watch: args["--watch"] ?? cliOptions.test.watch,
    ui: args["--ui"] ?? cliOptions.test.ui,
    coverage: args["--coverage"] ?? cliOptions.test.coverage,
    regular: {
      enabled: args["--regular"] || cliOptions.test.regular.enabled,
      environment: isValidEnv(environment) ? environment : "node",
    },
    browser: {
      enabled: args["--browser"] || cliOptions.test.browser.enabled,
      browsers: isValidBrowserList(browsers) ? browsers : ["chromium"],
      headless: args["--headless"] || cliOptions.test.browser.headless,
    },
  });
}

/**
 * Build runner.
 */
if (args._.includes("build")) {
  const buildProcess = await buildRunner({
    ...cliOptions.build,
    tsconfig: args["--tsconfig"] || cliOptions.build.tsconfig,
    watch: args["--watch"] ?? cliOptions.build.watch,
  });

  if (buildProcess) childProcess = buildProcess;
}

/**
 * Pack runner to prepare publishing of a package.
 */
if (args._.includes("pack")) {
  await packRunner({
    cleanPackageJson: cliOptions.pack.cleanPackageJson,
    restore: !!args["--restore"],
  });
}

/**
 * Wait for the runner process to be done if it's not running in the main process.
 */
if (childProcess) {
  await new Promise((resolve) => {
    childProcess.on("close", resolve);
  });
}

/**
 * Exit the CLI process with the appropriate exit code to make CI fail on any error.
 */
if (
  args["--watch"] === undefined &&
  !cliOptions.test.watch &&
  args["--ui"] === undefined &&
  !cliOptions.test.ui
) {
  process.exit(childProcess?.exitCode ?? process.exitCode ?? 0);
}
