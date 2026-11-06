/**
 * The URL schemes a link may have. Any other (`javascript:`, `vbscript:`, …) does not
 * count as a link: opening it could run script with access to the app window.
 */
const LINK_PROTOCOLS = ["http:", "https:", "blob:", "data:"];
/**
 * The scheme of a link, if it counts as a link
 * @param url The link: absolute, or relative to the page
 * @returns The scheme as the browser reads it (lower case, with the colon, after leading
 *          spaces and control characters and with tabs and newlines removed), or null for
 *          no link, a link that cannot be parsed and a scheme not in LINK_PROTOCOLS
 */
const getLinkProtocol = (url) => {
    if (!url)
        return null;
    let protocol;
    try {
        protocol = new URL(url, document.baseURI).protocol;
    }
    catch {
        return null;
    }
    return LINK_PROTOCOLS.includes(protocol) ? protocol : null;
};
export default getLinkProtocol;
