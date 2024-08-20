export type PageConfig = {
  title: string;
  path: string;
  tag: string;
} | null;

export type MenuConfig = {
  [key: string]: PageConfig[];
};
