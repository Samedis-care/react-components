/**
 * turn // to / in paths
 * @param path The path to normalize
 */
export const normalizePath = (path) => {
    while (path.includes("//"))
        path = path.replace("//", "/");
    return path;
};
/**
 * Percent-decodes a path segment, as {@link matchPath} reads the location's
 * segments. RoutedTabs reads its segment with it too, so it selects the Tab
 * whose panel a Route shows, and a Form's leave guard compares its Route's
 * url with a navigation's target with it. Not exported from the package root.
 * @param segment The segment of a location pathname
 * @returns The decoded segment; the segment as it is if it has a malformed
 * escape
 */
export const decodeSegment = (segment) => {
    if (!segment.includes("%"))
        return segment;
    try {
        return decodeURIComponent(segment);
    }
    catch {
        return segment;
    }
};
/**
 * match a location to a route
 * The location's segments are percent-decoded before they are compared to the
 * route's literal segments and given as params, so a location matches the same
 * whether the history keeps it encoded (a browser history: "/%C3%BCber") or as
 * text (a memory history: "/über"). Write a route's literal segments as text
 * ("/über"): they are not decoded.
 * @param pattern the route
 * @param pathname the location pathname
 * @return PathMatch if matched, null if not
 */
const matchPath = (pattern, pathname) => {
    const locSplit = normalizePath(pathname)
        .split("/")
        .filter((x) => !!x);
    const routeSplit = normalizePath(pattern.path)
        .split("/")
        .filter((x) => !!x);
    if (routeSplit.length === 0)
        return locSplit.length === 0 ? { url: "/", params: {} } : null;
    const freeEnd = routeSplit[routeSplit.length - 1] === "*";
    if (pattern.end) {
        if (locSplit.length > routeSplit.length && !freeEnd)
            return null;
    }
    if (routeSplit.length > locSplit.length && !freeEnd) {
        return null;
    }
    const params = [];
    for (let i = 0; i < routeSplit.length; ++i) {
        if (routeSplit[i] === "*")
            continue;
        if (locSplit[i] == null)
            return null;
        if (routeSplit[i].startsWith(":")) {
            params.push([routeSplit[i].substring(1), decodeSegment(locSplit[i])]);
            continue;
        }
        let r = routeSplit[i];
        let l = decodeSegment(locSplit[i]);
        if (!pattern.caseSensitive) {
            r = r.toLowerCase();
            l = l.toLowerCase();
        }
        if (r !== l) {
            return null;
        }
    }
    return {
        url: "/" +
            locSplit
                .slice(0, freeEnd ? routeSplit.length - 1 : routeSplit.length)
                .join("/"),
        params: Object.fromEntries(params),
    };
};
export default matchPath;
