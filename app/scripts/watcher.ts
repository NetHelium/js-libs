#!/usr/bin/env -S pnpm tsx

import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { watch } from "chokidar";
import { getPageData, getWorkspacePackages, updatePagePositionInCode } from "./helpers";

type PageConfig = {
  title: string;
  path: string;
  tag: string;
} | null;

type MenuConfig = {
  [key: string]: PageConfig[];
};

type FileAction = "added" | "changed" | "deleted";

/**
 * In-memory menu config
 */
const menuConfig: MenuConfig = {};

/**
 * Write the config on disk which will cause the server to reload the app with the updated menu.
 */
const saveMenuConfig = async () => {
  // Prepare the menu config to be written in JSON by deleting the null values in the links
  const jsonFormatMenuConfig = Object.entries(menuConfig).reduce(
    (acc, [k, v]) =>
      Object.assign(acc, {
        [k]: v.filter((x) => x),
      }),
    {},
  );

  // Write the menu config
  await writeFile("./config/menu.json", JSON.stringify(jsonFormatMenuConfig, null, 2), "utf8");
};

/**
 * Initialise menu config on startup based on the pages in the file system.
 */
const initMenuConfig = async () => {
  const basePath = path.join(process.cwd(), "src/pages");
  const pagePaths = await readdir(basePath, { recursive: true });

  for (const pagePath of pagePaths) {
    // Skip directories
    if (!pagePath.endsWith(".ts")) continue;

    // Skip home page
    if (pagePath.endsWith("home-page.ts")) continue;

    const { tag, title, position, urlPath } = await getPageData(path.join(basePath, pagePath));

    if (!tag) {
      console.log(`Unable to find the page's HTML tag in ${pagePath}. Skipping page...`);
      continue;
    }

    if (!title) {
      console.log(`Unable to find the page title in ${pagePath}. Skipping page...`);
      continue;
    }

    if (!position) {
      console.log(`Unable to find the page position in ${pagePath}. Skipping page...`);
      continue;
    }

    const pkg = getWorkspacePackages().find(({ name }) => name.includes(urlPath.split("/").at(1)!));

    if (!pkg) {
      console.log(`Unable to determine the associated package for ${pagePath}. Skipping page...`);
      continue;
    }

    // Build the config of the page
    const pageConfig: PageConfig = {
      title,
      path: urlPath,
      tag,
    };

    if (!Array.isArray(menuConfig[pkg.name])) menuConfig[pkg.name] = [];
    menuConfig[pkg.name][position - 1] = pageConfig;
  }

  await saveMenuConfig();
};

/**
 * Build the config of a page and update the menu config.
 *
 * @param path the file path of the page
 * @param action The type of action performed on the page
 */
const updateMenuConfig = async (path: string, action: FileAction) => {
  // Ignore the home page
  if (path.endsWith("home-page.ts")) {
    return;
  }

  // Determine the package of the page
  const urlPath = path.replace(/^src\/pages/, "").replace(/\.ts$/, "");
  const pkg = getWorkspacePackages().find(({ name }) => name.includes(urlPath.split("/").at(1)!));

  if (!pkg) {
    console.log(`Unable to determine the associated package for ${path}. Skipping page...`);
    return;
  }

  // If the page has been deleted
  if (action === "deleted") {
    if (Array.isArray(menuConfig[pkg.name])) {
      // Keep all pages of the package except the deleted one
      menuConfig[pkg.name] = menuConfig[pkg.name].filter((link) => link?.path !== urlPath);

      // Remove the package key if there's no page left
      if (menuConfig[pkg.name].length === 0) {
        delete menuConfig[pkg.name];
      }
    }

    await saveMenuConfig();
    return;
  }

  const { tag, title, position } = await getPageData(path);

  if (!tag) {
    console.log(`Unable to find the page's HTML tag in ${path}. Skipping page...`);
    return;
  }

  if (!title) {
    console.log(`Unable to find the page title in ${path}. Skipping page...`);
    return;
  }

  if (!position) {
    console.log(`Unable to find the page position in ${path}. Skipping page...`);
    return;
  }

  // Build the config of the page
  const pageConfig: PageConfig = {
    title,
    path: urlPath,
    tag,
  };

  // Update the menu config based on the action performed on the page
  switch (action) {
    // If the page has been created
    case "added":
      if (!Array.isArray(menuConfig[pkg.name])) menuConfig[pkg.name] = [];
      menuConfig[pkg.name][position - 1] = pageConfig;

      break;

    // If the page has been modified
    case "changed":
      if (Array.isArray(menuConfig[pkg.name])) {
        // Current index
        const idx = menuConfig[pkg.name].findIndex((link) => link?.path === pageConfig.path);

        if (position - 1 !== idx) {
          // Swap positions if another page is in the target position
          const otherPageConfig = menuConfig[pkg.name][position - 1];

          if (otherPageConfig) {
            await updatePagePositionInCode(otherPageConfig.path, idx + 1);
            menuConfig[pkg.name][idx] = otherPageConfig;
          } else {
            menuConfig[pkg.name][idx] = null;
          }

          menuConfig[pkg.name][position - 1] = pageConfig;
        } else {
          // Position has not changed
          menuConfig[pkg.name][idx] = pageConfig;
        }
      }

      break;

    default:
      throw new Error(`Action "${action}" not supported (${path})`);
  }

  await saveMenuConfig();
};

await initMenuConfig();

// Watch the file system to detect changes in the pages directory
watch("./src/pages/**/*.ts", { ignoreInitial: true })
  .on("add", async (path) => await updateMenuConfig(path, "added"))
  .on("change", async (path) => await updateMenuConfig(path, "changed"))
  .on("unlink", async (path) => await updateMenuConfig(path, "deleted"));
