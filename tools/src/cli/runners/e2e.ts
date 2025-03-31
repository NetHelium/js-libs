import path from "node:path";
import chalk from "chalk";
import { getToolsBinPath, getToolsProject, pathExists, streamCmd } from "../../utils";
import { printBanner, printError } from "../messages";

export type E2eRunnerOptions = {
  /**
   * Configuration filename (without the extension) to customize the runner's behavior. The config
   * file must be located in the `dist/e2e/config` directory (built from source in the
   * `src/e2e/config` directory). If omitted, the `default` configuration will be used.
   */
  config: string;

  /**
   * Open the test results in a web UI. If omitted, this option won't be active.
   */
  ui: boolean;
};

export default async (options: E2eRunnerOptions) => {
  let bannerMessage = "E2E tests";
  const playwright = await getToolsBinPath("playwright");

  if (!playwright) {
    const errorMessages = [
      "The e2e test runner (playwright) could not be found!",
      "Make sure playwright is installed in the tools project.",
    ];

    return await printError(errorMessages.join("\n"), { bannerText: bannerMessage });
  }

  const e2eRunnerArgs: string[] = ["test"];

  if (options.config) {
    const toolsProjectPath = (await getToolsProject())!.path;
    const configFilePath = path.join(toolsProjectPath, "dist/e2e/configs", `${options.config}.js`);

    if (!(await pathExists(configFilePath))) {
      const errorMessages = [
        [
          `Unable to find configuration ${chalk.bold(options.config)}`,
          `in ${chalk.bold(path.dirname(configFilePath))}!`,
        ].join(" "),
        "Check for any spelling mistake or create a new configuration.",
      ];

      return await printError(errorMessages.join("\n"), { bannerText: bannerMessage });
    }

    e2eRunnerArgs.push("--config", configFilePath);
  }

  if (options.ui) {
    bannerMessage = `${bannerMessage} in UI mode`;
    e2eRunnerArgs.push("--ui");
  }

  await printBanner(bannerMessage);
  return streamCmd(playwright, e2eRunnerArgs);
};
