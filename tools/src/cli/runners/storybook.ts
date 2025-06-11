import { getProjectBinPath, streamCmd } from "../../utils";
import { printBanner, printError, printNewLine } from "../messages";

/**
 * Available Storybook commands.
 */
export const commands = ["dev"] as const;

export type StorybookRunnerOptions = {
  /**
   * Storybook command to run.
   *
   * @default "dev"
   */
  command: (typeof commands)[number];

  /**
   * Port used by Storybook's server.
   *
   * @default 6006
   */
  port: number;
};

export default async (options: StorybookRunnerOptions) => {
  const bannerMessage = "Storybook";
  const storybook = await getProjectBinPath("storybook");

  if (!storybook) {
    const errorMessages = [
      "Storybook's executable could not be found!",
      "Make sure Storybook is installed in the targeted project.",
    ];

    process.exitCode = 1;
    return await printError(errorMessages.join("\n"), { bannerText: bannerMessage });
  }

  const { command, port } = options;
  await printBanner(bannerMessage);
  printNewLine();
  streamCmd(storybook, [command, "-p", port.toString()]);
};
