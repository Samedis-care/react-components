/**
 * Matches a mime type to a mime type pattern
 * @param pattern The mime type pattern (e.g. "image/*")
 * @param actual The actual mime type to match (e.g. "image/jpg")
 * @returns true if actual matches pattern, otherwise false
 */
var matchMime = function (pattern, actual) {
    // strip extra info (e.g. audio/ogg; codecs=opus)
    if (actual.includes(";"))
        actual = actual.split(";")[0];
    // split the type into components
    var patternComponents = pattern.split("/").map(function (e) { return e.toLowerCase(); });
    var actualComponents = actual.split("/").map(function (e) { return e.toLowerCase(); });
    if (patternComponents.length !== actualComponents.length)
        return false;
    // match with wildcard support
    for (var i = 0; i < patternComponents.length; ++i) {
        if (patternComponents[i] === "*")
            continue;
        if (patternComponents[i] !== actualComponents[i])
            return false;
    }
    return true;
};
export default matchMime;
