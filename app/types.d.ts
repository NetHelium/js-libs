/**
 * Page configuration.
 */
export type PageConfig = {
  title: string;
  path: string;
  tag: string;
} | null;

/**
 * Menu configuration.
 */
export type MenuConfig = {
  [key: string]: PageConfig[];
};
