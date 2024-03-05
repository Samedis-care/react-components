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
 * match a location to a route
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
        return null;
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
            params.push([routeSplit[i].substring(1), locSplit[i]]);
            continue;
        }
        let r = routeSplit[i];
        let l = locSplit[i];
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
