import { getProjectBinPath, streamCmd } from "../../utils";
import { printBanner, printError, printNewLine } from "../messages";

export type StorybookRunnerOptions = {
  /**
   * The storybook command to run.
   */
  cmd: string;

  /**
   * The port that will be used by storybook's built-in server.
   */
  port: number;
};

export default async (options: StorybookRunnerOptions) => {
  const bannerMessage = "Storybook";
  const storybook = await getProjectBinPath("storybook");

  if (!storybook) {
    const errorMessages = [
      "The storybook executable could not be found!",
      "Make sure storybook is installed in the targeted project.",
    ];

    return await printError(errorMessages.join("\n"), { bannerText: bannerMessage });
  }

  const storybookRunnerArgs: string[] = [options.cmd];

  // The port option only makes sense in the dev context (there's no server to start otherwise)
  if (options.cmd === "dev") {
    storybookRunnerArgs.push("-p", options.port.toString());
  }

  await printBanner(bannerMessage);
  printNewLine();
  streamCmd(storybook, storybookRunnerArgs);
};
