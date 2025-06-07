import { access } from "node:fs/promises";
import path from "node:path";

/**
 * Generator function yielding the full path of each directory until the root directory is reached.
 *
 * @param initialPath the initial path (relative or absolute) to start the lookup. If omitted, the
 * lookup starts from the current working directory
 */
export function* lookupDir(initialPath?: string): Generator<string> {
  if (!initialPath) initialPath = process.cwd();
  let dir = path.resolve(initialPath);
  const { root } = path.parse(dir);

  while (dir && dir !== root) {
    yield dir;
    dir = path.dirname(dir);
  }
}

/**
 * Check if a path exists in the file system (file or directory).
 *
 * @param pathToCheck the path to check (relative or absolute)
 * @returns `true` if the path exists and `false` otherwise
 */
export const pathExists = async (pathToCheck: string) => {
  try {
    await access(path.resolve(pathToCheck));
    return true;
  } catch {
    return false;
  }
};
