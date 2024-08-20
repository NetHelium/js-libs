import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

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
 * Get the list of registered packages in the pnpm workspace.
 * @returns the registered packages
 */
export const getWorkspacePackages = () => {
  // Get the list of registered projects in the pnpm workspace.
  const projects = JSON.parse(
    execSync("pnpm list -r --only-projects --depth -1 --json").toString(),
  ) as Project[];

  // Only keep the packages (all projects inside the `packages` directory).
  return projects.filter((project) => project.path.includes("/packages/"));
};

/**
 * Extract metadata of a page from its file path.
 * @param filePath the file path of the page
 * @returns the page metadata
 */
export const getPageData = async (filePath: string) => {
  const code = await readFile(filePath, "utf-8");
  const urlPath = filePath.replace(/^.*\/src\/pages/, "").replace(/\.ts$/, "");
  const tag = code.match(/@customElement\("([a-z0-9-]+)"\)/)?.at(1);
  const metadata = code.match(/static override metadata[^{]*({[^}]+};?)/)?.at(1);
  const title = metadata?.match(/title: ?(?:'|")(.*)(?:'|")/)?.at(1);
  const positionString = metadata?.match(/position: ?(\d*)/)?.at(1);
  const position = positionString ? Number.parseInt(positionString) : undefined;

  return { title, tag, urlPath, position };
};

/**
 * Get the list of positions for existing pages in the given package.
 * @param packageName the name of the package associated with the pages
 * @returns the positions of the existing pages
 */
export const getPagePositions = async (packageName: string) => {
  const packagePath = path.join(process.cwd(), "src/pages", packageName.split("/").at(1)!);
  if (!existsSync(packagePath)) return [];

  const pagePaths = await readdir(packagePath, { recursive: true });
  const positions: number[] = [];

  for (const pagePath of pagePaths) {
    // Skip directories
    if (!pagePath.endsWith(".ts")) continue;

    const { position } = await getPageData(`${packagePath}/${pagePath}`);
    if (position) positions.push(position);
  }

  return positions;
};

/**
 * Update the position of a page in the source code.
 * @param urlPath the url path of the page
 * @param position the new position of the page
 */
export const updatePagePositionInCode = async (urlPath: string, position: number) => {
  const filepath = path.join(process.cwd(), "src/pages", `${urlPath}.ts`);
  const regex = /^(.*)(static override metadata[ ={]+)(.*)(position:\s*)(\d+)(.*)$/s;
  const code = await readFile(filepath, "utf-8");
  await writeFile(filepath, code.replace(regex, `$1$2$3$4${position}$6`), "utf-8");
};
