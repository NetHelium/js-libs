/**
 * Possible variants for an icon.
 */
export type IconVariant = "outlined" | "filled";

/**
 * An icon value is an object with either a list of svg paths for each variant or a single list of
 * paths if the icon doesn't have any variant.
 */
type IconValue = Record<IconVariant, string[]> | string[];

/**
 * Icon data store.
 */
type IconStore = {
  /**
   * The list of icons loaded in the store.
   */
  icons: Record<string, IconValue>;
};

/**
 * Options available when loading icons in the store.
 */
type IconLoadOptions = {
  /**
   * When `true`, the existing icons in the store will be removed.
   *
   * @default false
   */
  override: boolean;
};

const store: IconStore = {
  icons: {},
};

/**
 * Get the paths for an icon loaded in the store.
 * @param name the name of the icon
 * @param variant the variant of the icon if applicable
 * @returns the list of svg paths of the icon or undefined if no matching icon was found
 */
export const getIconPaths = (name: string, variant?: IconVariant) => {
  const icon = store.icons[name];

  if (!icon) {
    return;
  }

  if (Array.isArray(icon)) {
    return icon;
  }

  if (variant) {
    return icon[variant];
  }
};

/**
 * Load an extra icon in the store.
 * @param name the name of the icon
 * @param paths the list of svg paths
 * @param options the load options
 */
export const loadIcon = (name: string, paths: IconValue, options?: IconLoadOptions) => {
  const override = options?.override ?? false;
  store.icons = override ? { [name]: paths } : { ...store.icons, [name]: paths };
};

/**
 * Load a list of icons in the store.
 * @param icons the list of icons to load
 * @param options the load options
 */
export const loadIcons = (icons: Record<string, IconValue>, options?: IconLoadOptions) => {
  const override = options?.override ?? false;
  store.icons = override ? icons : { ...store.icons, ...icons };
};
