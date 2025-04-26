/**
 * Extract the host and path from a url.
 *
 * @param url the url
 * @returns the host and path or `undefined` if the url is not valid
 */
export const getHostPathFromUrl = (url: string) => {
  let urlInfo: URL;

  try {
    urlInfo = new URL(decodeURIComponent(url));
  } catch {
    return undefined;
  }

  const { host, pathname } = urlInfo;
  return `${host}${pathname === "/" ? "" : pathname}`;
};

/**
 * Extract all the params matching the given `regexes` from a url.
 *
 * @param url the url
 * @param regexes the pattern(s) to match
 * @returns the params matching the `regexes`
 */
export const getMatchingParamsFromUrl = (
  url: string,
  ...regexes: RegExp[]
): Record<string, string> => {
  const urlParams = [...new URL(url).searchParams];
  let extractedParams: [string, string][] = [];

  for (const regex of regexes) {
    extractedParams = [...extractedParams, ...urlParams.filter((entry) => regex.test(entry[0]))];
  }

  return Object.fromEntries(extractedParams);
};

/**
 * Merge the existing params of the given `url` with the given `params`.
 *
 * @param url the original url
 * @param params the params to add
 * @param options the options
 * @returns the altered url with the new params
 */
export const getUrlWithParams = (
  url: string,
  params: Record<string, string>,
  options?: {
    /**
     * set to `false` to preserve the values of existing params or `true` to override
     * @default false
     */
    override?: boolean;
  },
) => {
  const override = options?.override ?? false;
  const urlParams = Object.fromEntries(new URL(url).searchParams);
  const newParams = override ? { ...urlParams, ...params } : { ...params, ...urlParams };

  const queryString = Object.keys(newParams)
    .map((key) => `${key}=${encodeURIComponent(newParams[key]!)}`)
    .join("&");

  return `${url.split("?")[0]}?${queryString}`;
};
