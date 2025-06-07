import { concurrently } from "concurrently";
import { cmd } from "../../utils";
import { printBanner, printNewLine } from "../messages";

/**
 * Start a package in development mode by building it in watch mode and launching a dev server.
 */
export default async () => {
  await printBanner("Dev mode");
  printNewLine();

  // Make sure a build of the package exists before starting the dev server to avoid an error
  await cmd("pnpm", ["build"]);

  concurrently([
    /**
     * Build the package in watch mode.
     */
    {
      name: "package",
      command: "pnpm build --watch",
    },

    /**
     * Start the development app.
     */
    {
      name: "server",
      command: "pnpm --filter @net-helium/app dev",
    },
  ]);
};
