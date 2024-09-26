/**
 * Determine if a hex color is considered light.
 *
 * @param hex the color in hex format
 * @returns `true` if the color is considered light, `false` otherwise
 */
export const hexColorIsLight = (hex: string) => {
  hex = hex.replace("#", "").trim();

  const red = Number.parseInt(hex.substring(0, 2), 16);
  const green = Number.parseInt(hex.substring(2, 4), 16);
  const blue = Number.parseInt(hex.substring(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 155;
};

/**
 * Determine if a hex color is considered dark.
 *
 * @param hex the color in hex format
 * @returns `true` if the color is considered dark, `false` otherwise
 */
export const hexColorIsDark = (hex: string) => !hexColorIsLight(hex);
