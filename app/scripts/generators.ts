import { existsSync } from "node:fs";
import path from "node:path";
import type { NodePlopAPI } from "plop";
import { getPagePositions, getWorkspacePackages } from "./helpers";

/**
 * Answers of the prompts when creating a new page with the generator.
 */
type PageAnswers = {
  [key in "package" | "title" | "path"]: string;
};

type NextPositions = {
  [key: string]: number;
};

// Next page positions based on the existing ones for each associated package.
const nextPositions: NextPositions = {};

for (const pkg of getWorkspacePackages()) {
  const currentMax = Math.max(...(await getPagePositions(pkg.name)));
  nextPositions[pkg.name] = (currentMax === Number.NEGATIVE_INFINITY ? 0 : currentMax) + 1;
}

/**
 * Definition of the generators and handlebars helpers
 */
export default ({ setHelper, setGenerator }: NodePlopAPI) => {
  /**
   * Custom handlebars helper to construct the page's HTML tag from the chosen path.
   */
  setHelper("pageTag", (path: string) => path.split("/").join("--"));

  /**
   * Custom handlebars helper to get the next page position for the given package.
   */
  setHelper("pagePosition", (packageName: string) => nextPositions[packageName]);

  /**
   * Generator to create a new page.
   */
  setGenerator("page", {
    description: "Create a new page",
    prompts: [
      {
        name: "package",
        message: "This page belongs to which package?",
        type: "list",
        choices: getWorkspacePackages().map(({ name }) => name),
      },
      {
        name: "title",
        message: "Page title? (will be displayed in the menu)",
        type: "input",
        validate: (value: string) => {
          if (value.trim().length === 0) {
            return "The title can't be empty!";
          }

          return true;
        },
      },
      {
        name: "path",
        message: "Path of the page? (will be prefixed by the package name without the scope)",
        type: "input",
        default: (answers: PageAnswers) => answers.title.toLocaleLowerCase().replace(/\s+/g, "-"),
        filter: (input: string, answers: PageAnswers) => {
          const arr = input.split("/").filter((x) => x !== "");
          arr.splice(0, 0, answers.package.split("/").at(-1)!);

          return arr.join("/");
        },
        validate: (value: string, _answers: PageAnswers) => {
          if (!/^[a-z0-9/-]+$/.test(value)) {
            return "Only slashes, dashes and alphanumerical characters are accepted!";
          }

          if (existsSync(path.join(process.cwd(), "src/pages", `${value}.ts`))) {
            return "A page with the same path already exists!";
          }

          return true;
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "../src/pages/{{ path }}.ts",
        templateFile: "./templates/page.hbs",
      },
    ],
  });
};
