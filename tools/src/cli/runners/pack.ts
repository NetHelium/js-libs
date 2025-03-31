import { clean, load, restore } from "clean-package";
import { printBanner, printNewLine } from "../messages";

export type PackRunnerOptions = {
  /**
   * Sections of the package.json file that need to be removed in the published package.
   *
   * @default ["scripts", "devDependencies"]
   */
  cleanPackageJson: string[];
};

export default async (options: PackRunnerOptions & { restore: boolean }) => {
  const bannerMessage = "Pack";

  await printBanner(bannerMessage);
  printNewLine();

  if (options.cleanPackageJson) {
    const [packageJson, config] = load();

    if (options.restore) {
      restore({ ...config, remove: options.cleanPackageJson });
    } else {
      clean(packageJson, { ...config, remove: options.cleanPackageJson });
    }

    printNewLine();
  }
};
