/**
 * Adds the given query parameters to the given url
 * @param url The base url
 * @param args The query parameters
 * @private
 * @returns The url with query parameter
 */
declare const addGetParams: (url: string, args: Record<string, unknown> | null) => string;
export default addGetParams;
