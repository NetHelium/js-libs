import { lookupDir, pathExists } from "./fs";
import { cmd } from "./io";

/**
 * Detect the username using `git` or the `whoami` command.
 *
 * @returns the username or `Developer` if none was detected (unlikely)
 */
export const getUsername = async () => {
  let output = await cmd("git", ["config", "user.name"]);
  let username = output.stdout;
  if (username) return username;

  output = await cmd("whoami");
  username = output.stdout;
  return username || "Developer";
};

/**
 * Detect the projects inside the workspace.
 *
 * @returns the list of projects in the workspace
 */
export const getProjects = async (): Promise<
  {
    name: string;
    version: string;
    path: string;
    private: boolean;
  }[]
> => {
  const { stdout } = await cmd("pnpm", ["ls", "-r", "--depth", "-1", "--json"]);
  return JSON.parse(stdout);
};

/**
 * Get information about the root project in the workspace.
 *
 * @returns the information of `undefined` if the root project could not be found
 */
export const getRootProject = async () =>
  (await getProjects()).find(({ name }) => name === "js-libs");

/**
 * Detect the full path to an executable in the root project.
 *
 * @param bin the wanted executable
 * @returns the full path of the executable or `undefined` if not found
 */
export const getRootBinPath = async (bin: string) => {
  const rootProject = await getRootProject();

  if (rootProject) {
    const binPath = `${rootProject.path}/node_modules/.bin/${bin}`;
    if (await pathExists(binPath)) return binPath;
  }
};

/**
 * Get information about the tools project in the workspace.
 *
 * @returns the information or `undefined` if the tools project could not be found
 */
export const getToolsProject = async () =>
  (await getProjects()).find(({ name }) => name.split("/").at(1) === "tools");

/**
 * Detect the full path to an executable in the tools project.
 *
 * @param bin the wanted executable
 * @returns the full path of the executable or `undefined` if not found
 */
export const getToolsBinPath = async (bin: string) => {
  const toolsProject = await getToolsProject();

  if (toolsProject) {
    const binPath = `${toolsProject.path}/node_modules/.bin/${bin}`;
    if (await pathExists(binPath)) return binPath;
  }
};

/**
 * Detect the full path to an executable in the project of the current working directory.
 *
 * @param bin the wanted executable
 * @returns the full path of the executable or `undefined` if not found
 */
export const getProjectBinPath = async (bin: string) => {
  const projects = await getProjects();
  const projectName = await getProjectName();
  const project = projects.find(({ name }) => name === projectName);

  if (project) {
    const binPath = `${project.path}/node_modules/.bin/${bin}`;
    if (await pathExists(binPath)) return binPath;
  }
};

/**
 * Detect the name of the project in the current directory.
 *
 * @returns the project name of `undefined` if none was found
 */
export const getProjectName = async () => {
  for (const dir of lookupDir()) {
    const packageJsonPath = `${dir}/package.json`;

    if (await pathExists(packageJsonPath)) {
      return await import(packageJsonPath, { with: { type: "json" } }).then(
        ({ default: pkg }: { default: { name: string } }) => pkg.name,
      );
    }
  }
};

/**
 * Detect the latest version of a project published in the npm registry.
 *
 * @param projectName the name of the project to look for. If omitted, an attempt to detect the
 * project name will be made based on the current working directory
 * @param fallback the fallback version if none was found in the registry
 * @returns the latest published version of the project or the `fallback` value if given or
 * `undefined` otherwise
 */
export const getLatestVersion = async (projectName?: string, fallback?: string) => {
  if (!projectName) projectName = await getProjectName();
  if (!projectName) return fallback;

  const { version } = await fetch(`https://registry.npmjs.org/${projectName}/latest`, {
    redirect: "follow",
  })
    .then((response) => response.json() as Promise<{ version: string }>)
    .catch(() => ({ version: fallback }));

  return version;
};
