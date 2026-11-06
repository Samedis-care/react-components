/**
 * The scheme of a link, if it counts as a link
 * @param url The link: absolute, or relative to the page
 * @returns The scheme as the browser reads it (lower case, with the colon, after leading
 *          spaces and control characters and with tabs and newlines removed), or null for
 *          no link, a link that cannot be parsed and a scheme not in LINK_PROTOCOLS
 */
declare const getLinkProtocol: (url: string | undefined) => string | null;
export default getLinkProtocol;
