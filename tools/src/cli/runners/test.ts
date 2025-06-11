import path from "node:path";
import chalk from "chalk";
import { type UserConfig, type UserWorkspaceConfig, startVitest } from "vitest/node";
import { getToolsProject } from "../../utils";
import { printBanner, printError } from "../messages";

/**
 * Available environments when running regular tests.
 */
export const environments = ["node", "jsdom"] as const;

/**
 * Available engines when running browser tests.
 */
export const browsers = ["chromium", "firefox", "webkit"] as const;

export type TestRunnerOptions = {
  /**
   * The TypeScript configuration to use while transpiling TypeScript into JavaScript on the fly
   * during tests execution. The path is relative to the project's root directory.
   *
   * @default "./tsconfig.json"
   */
  tsconfig: string;

  /**
   * Run the tests in watch mode.
   *
   * @default false
   */
  watch: boolean;

  /**
   * Visualize tests results in a web user interface. This mode forces the `watch` option since the
   * process needs to keep running in order for the web ui to stay available.
   *
   * @default false
   */
  ui: boolean;

  /**
   * Wether the runner should collect and report the test coverage. When used with the `ui` mode,
   * the coverage details are available in the web ui.
   *
   * The coverage can't be collected when running browser tests with engines other than `chromium`.
   * This option will therefore be disabled by force when running browser tests with `firefox` or
   * `webkit`.
   *
   * @default false
   */
  coverage: boolean;

  /**
   * Options for regular tests.
   *
   * The regular tests are the ones running on `node` or `jsdom` instead of actual browser engines.
   * The test filenames must end with `.test.ts` but not `.browser.test.ts` which is reserved for
   * browser tests.
   */
  regular: {
    /**
     * Wether to run the regular tests.
     *
     * @default false
     */
    enabled: boolean;

    /**
     * Default environment to use when running regular tests. This option will only affect test
     * files that do not force their intended environment using the special `@vitest-environment`
     * comment.
     *
     * `node` means the tests will run in the node runtime. This is the best choice when the code
     * being tested does not use browser specific features.
     *
     * `jsdom` means the tests will run in a simulated browser environment loaded on top of node
     * (a pure JavaScript implementation of browser specs). While most web standards are simulated
     * correctly, it is possible that `jsdom` produces false positives or negatives in some cases
     * compared to the behavior of an actual browser.
     *
     * @default "node"
     */
    environment: (typeof environments)[number];
  };

  /**
   * Options for browser tests.
   *
   * The browser tests are the ones running on actual browser engines (powered by Microsoft's
   * `Playwright`). The testing API is different from `jsdom` so specific test files have to be
   * written for the browser mode and filenames must end with `.browser.test.ts`. While running
   * tests in real browsers gives more confidence, it is also slower and should therefore be
   * reserved for critical functionality or in cases where the `jsdom` simulation is not good
   * enough.
   */
  browser: {
    /**
     * Wether to run the browser tests. Since these tests are slower to run, its better to run them
     * every once in a while rather than every time (when preparing a new release for example).
     *
     * @default false
     */
    enabled: boolean;

    /**
     * Browsers to test against when running browser tests.
     *
     * `chromium` is for Chromium based browsers like Google Chrome and Microsoft Edge
     *
     * `firefox` is for Mozilla Firefox
     *
     * `webkit` is for Webkit based browsers like Apple Safari
     *
     * @default ["chromium"]
     */
    browsers: (typeof browsers)[number][];

    /**
     * Run browser tests in headless mode (without the browser's ui) which is useful for CI.
     *
     * @default false
     */
    headless: boolean;
  };
};

type NhUserConfig = Omit<UserConfig, "workspace"> & {
  workspace: UserWorkspaceConfig[];
};

export default async (options: TestRunnerOptions) => {
  let bannerMessage = "";
  const toolsProjectPath = (await getToolsProject())!.path;
  const projectWorkingDir = process.cwd();

  const allTestsGlob = "(src|test)/**/*.test.ts";
  const browserTestsGlob = "(src|test)/**/*.browser.test.ts";
  const regularTestsSetup = path.join(toolsProjectPath, "dist/test/regular-setup.js");

  const { tsconfig, watch, ui, coverage, regular, browser } = options;
  const { enabled: regularTestsEnabled, environment } = regular;
  const { enabled: browserTestsEnabled, browsers, headless } = browser;

  const vitestOptions: NhUserConfig = {
    typecheck: {
      tsconfig: path.resolve(projectWorkingDir, tsconfig),
    },
    workspace: [],
  };

  if (regularTestsEnabled && browserTestsEnabled) {
    bannerMessage = "Regular and";
    if (headless) bannerMessage = `${bannerMessage} headless`;
    bannerMessage = `${bannerMessage} browser tests (${browsers.join(", ")})`;
  } else if (regularTestsEnabled) {
    bannerMessage = "Regular tests";
  } else if (browserTestsEnabled) {
    bannerMessage = headless ? "Headless browser" : "Browser";
    bannerMessage = `${bannerMessage} tests (${browsers.join(", ")})`;
  } else {
    const errorMessages = [
      "Regular and browser tests are disabled. Please enable at least one type of tests.",
      [
        "You can enable them with the",
        `${chalk.bold("test.regular.enable")} and ${chalk.bold("test.browser.enable")}`,
        "options in the project's configuration file.",
      ].join(" "),
      [
        "You can also use the",
        `${chalk.bold("--regular")} (or ${chalk.bold("-r")}) and`,
        `${chalk.bold("--browser")} (or ${chalk.bold("-b")})`,
        "command-line options.",
      ].join(" "),
    ];

    await printError(errorMessages.join("\n"));
    process.exitCode = 1;
    return;
  }

  if (regularTestsEnabled) {
    const jsdomOptions: (typeof vitestOptions)["environmentOptions"] = {
      jsdom: {
        resources: "usable",
      },
    };

    vitestOptions.workspace.push({
      test: {
        name: "regular",
        dir: projectWorkingDir,
        include: [path.join(projectWorkingDir, allTestsGlob)],
        exclude: [path.join(projectWorkingDir, browserTestsGlob)],
        environment,
        environmentOptions: environment === "jsdom" ? jsdomOptions : undefined,
        setupFiles: [regularTestsSetup],
      },
    });
  }

  if (browserTestsEnabled) {
    vitestOptions.workspace.push({
      test: {
        name: "browser",
        dir: projectWorkingDir,
        include: [path.join(projectWorkingDir, browserTestsGlob)],
        browser: {
          enabled: true,
          provider: "playwright",
          headless,
          instances: browsers.map((browser) => ({ browser })),
        },
      },
    });
  }

  vitestOptions.ui = false;
  vitestOptions.watch = false;

  if (ui) {
    bannerMessage = `${bannerMessage} in ui mode`;
    vitestOptions.ui = true;
    vitestOptions.watch = true;
  } else if (watch) {
    bannerMessage = `${bannerMessage} in watch mode`;
    vitestOptions.watch = true;
  }

  const coverageEnabled =
    coverage && (!browserTestsEnabled || (browsers.length === 1 && browsers[0] === "chromium"));

  if (coverageEnabled) {
    bannerMessage = `${bannerMessage} with code coverage`;

    vitestOptions.coverage = {
      enabled: true,
      provider: "v8",
      reportsDirectory: path.join(projectWorkingDir, ".nh/coverage"),
      allowExternal: true,
      include: [path.join(projectWorkingDir, "**")],
    };
  }

  await printBanner(bannerMessage);

  if (browserTestsEnabled || coverageEnabled) {
    process.chdir(toolsProjectPath);
  }

  await startVitest("test", [], vitestOptions);

  if (browserTestsEnabled || coverageEnabled) {
    process.chdir(projectWorkingDir);
  }
};
