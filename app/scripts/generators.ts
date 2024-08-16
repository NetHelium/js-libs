import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NodePlopAPI } from "plop";

/**
 * Project as returned by the pnpm command when using the `--json` flag.
 */
type Project = {
  name: string;
  version: string;
  path: string;
  private: boolean;
};

/**
 * Answers of the prompts when creating a new page with the generator.
 */
type PageAnswers = {
  [key in "package" | "name" | "path"]: string;
};

/**
 * Definition of the generators and handlebars helpers
 */
export default ({ getHelper, setHelper, setGenerator }: NodePlopAPI) => {
  // Get the list of projects registered in the pnpm workspace.
  const projects = JSON.parse(
    execSync("pnpm list -r --only-projects --depth -1 --json").toString(),
  ) as Project[];

  // Filter the projects to only keep the packages (all projects inside the `packages` directory).
  const packages = projects.filter(({ path }) => path.includes("/packages/"));

  /**
   * Custom handlebars helper to determine the pages directory based on the selected package.
   */
  setHelper("packageToDir", (packageName: string) => packageName.split("/").at(-1));
  const packageToDir = getHelper("packageToDir");

  /**
   * Custom handlebars helper to extract the page's HTML tag from the chosen path.
   */
  setHelper("pageTag", (path: string) => path.split("/").at(-1));
  const pageTag = getHelper("pageTag");

  /**
   * Generator to create a new page.
   */
  setGenerator("page", {
    description: "Create a new page",
    prompts: [
      {
        name: "package",
        message: "For which package is this page?",
        type: "list",
        choices: packages.map(({ name }) => name),
      },
      {
        name: "name",
        message: "Name of the page? (will be displayed in the menu)",
        type: "input",
        validate: (value: string) => {
          if (value.trim().length === 0) {
            return "The name can't be empty!";
          }

          return true;
        },
      },
      {
        name: "path",
        message: "Path of the page? (will be prefixed by the package name without the scope)",
        type: "input",
        filter: (input: string, _answers: PageAnswers) =>
          input
            .split("/")
            .filter((x) => x !== "")
            .join("/"),
        validate: (value: string, answers: PageAnswers) => {
          if (value.trim().length === 0) {
            return "The path can't be empty!";
          }

          if (!/^[a-z0-9/-]+$/.test(value)) {
            return "Only slashes, dashes and alphanumerical characters are accepted!";
          }

          const tag = pageTag(value);

          if (!tag.includes("-")) {
            return "The part after the last slash should have one or more dashes!";
          }

          if (/^[0-9]/.test(tag)) {
            return "The part after the last slash should start with a letter!";
          }

          if (
            existsSync(
              join(process.cwd(), "src/pages", packageToDir(answers.package), `${value}.ts`),
            )
          ) {
            return "A page with the same path already exists!";
          }

          return true;
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "../src/pages/{{ packageToDir package }}/{{ path }}.ts",
        templateFile: "./templates/page.hbs",
      },
    ],
  });
};
