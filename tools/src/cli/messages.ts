import chalk from "chalk";
import { getProjectName } from "../utils";

const [stdout, stderr] = [process.stdout, process.stderr];

/**
 * Print a banner with the given `text` prefixed by the project's name in the current working
 * directory.
 * @param text the text to display in the banner
 */
export const printBanner = async (text: string) => {
  const parts = [
    chalk.bgGreen.bold(" NH CLI "),
    chalk.cyan.bold(` ${await getProjectName()}`),
    chalk.bold(" > "),
    chalk.cyan.bold(text),
  ];

  stdout.write(`${parts.join("")}\n`);
};

/**
 * Print an error message.
 * @param text the error message
 * @param options the printing options
 */
export const printError = async (text: string, options?: { bannerText?: string }) => {
  const bannerText = options?.bannerText ? `ERROR - ${options.bannerText}` : "ERROR";
  await printBanner(chalk.red.bold(bannerText));
  stderr.write(`\n${chalk.red(text)}\n\n`);
};

/**
 * Print a new line in the CLI output.
 */
export const printNewLine = () => {
  stdout.write("\n");
};
