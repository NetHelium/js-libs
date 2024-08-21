/**
 * [Helium Connect] Extract the form ID from its `url`.
 * @param url the form url
 * @returns the form ID if detected or `undefined` otherwise
 */
export const hcFormIdFromUrl = (url: string) => {
  const matches = url.match(/(?:fid|forms)\/(?<id>[a-f\d]{24})/i);
  return matches?.groups?.id;
};

/**
 * [Helium Connect] Extract the form slug from its `url`.
 * @param url the form url
 * @returns the form slug if detected or `undefined` otherwise
 */
export const hcFormSlugFromUrl = (url: string) => {
  const matches = url.match(/fpl\/(?<slug>[a-z\d-_]+)/i);
  return matches?.groups?.slug;
};
