import { getRootBinPath, streamCmd } from "../../utils";
import { printBanner, printError, printNewLine } from "../messages";

export type TSCheckRunnerOptions = {
  /**
   * The TypeScript configuration to use for the check. If omitted, the configuration of the
   * `tsconfig.json` file in the current working directory will be used.
   */
  tsconfig: string;
};

export default async (options: TSCheckRunnerOptions) => {
  const bannerMessage = "TypeScript Check";
  const tsc = await getRootBinPath("tsc");

  if (!tsc) {
    const errorMessages = [
      "The TypeScript compiler (tsc) could not be found!",
      "Make sure typescript is installed in the root project.",
    ];

    return await printError(errorMessages.join("\n"), { bannerText: bannerMessage });
  }

  const tscArgs: string[] = [];

  // TypeScript config to follow for the check
  tscArgs.push("-p", options.tsconfig);

  // Disable emitting type definitions
  tscArgs.push("--emitDeclarationOnly", "false", "--noEmit");

  await printBanner(bannerMessage);
  printNewLine();

  return streamCmd(tsc, tscArgs);
};
