import path from "node:path";
import chalk from "chalk";
import { type UserConfig, startVitest } from "vitest/node";
import { getToolsProject, pathExists } from "../../utils";
import { printBanner, printError } from "../messages";

export type TestRunnerOptions = Omit<UserConfig, "config"> & {
  /**
   * Configuration filename (without the extension) to customize the runner's behavior. The config
   * file must be located in the `dist/test/config` directory (built from source in the
   * `src/test/config` directory).
   *
   * @default "node"
   */
  config: string;

  /**
   * The runner will report the test coverage. If the UI mode is also active, the coverage details
   * will be accessible in the web UI.
   *
   * @default false
   */
  codeCoverage: boolean;
};

export default async (options: TestRunnerOptions) => {
  let bannerMessage = "Unit tests";

  const toolsProjectPath = (await getToolsProject())!.path;
  const projectWorkingDir = process.cwd();

  if (options.config) {
    const configFilePath = path.join(toolsProjectPath, "dist/test/configs", `${options.config}.js`);

    if (!(await pathExists(configFilePath))) {
      const errorMessages = [
        [
          `Unable to find configuration ${chalk.bold(options.config)}`,
          `in ${chalk.bold(path.dirname(configFilePath))}!`,
        ],
        "Check for any spelling mistake or create a new configuration.",
      ];

      return await printError(errorMessages.join("\n"), { bannerText: bannerMessage });
    }

    options.config = configFilePath;
  }

  options.dir = projectWorkingDir;
  options.include = [path.join(projectWorkingDir, "(src|test)/**/*.test.ts")];

  if (options.ui) {
    bannerMessage = `${bannerMessage} in UI mode`;
    options.watch = true;
  }

  if (options.codeCoverage) {
    bannerMessage = `${bannerMessage} with code coverage`;

    options.coverage = {
      enabled: true,
      reportsDirectory: path.join(projectWorkingDir, ".nh/coverage/test"),
      allowExternal: true,
      include: [path.join(projectWorkingDir, "**")],
    };
  }

  await printBanner(bannerMessage);

  if (options.codeCoverage) process.chdir(toolsProjectPath);
  await startVitest("test", [], options);
  if (options.codeCoverage) process.chdir(projectWorkingDir);
};
