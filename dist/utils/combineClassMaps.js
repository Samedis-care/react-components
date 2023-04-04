/**
 * Combines multiple class maps to a single one
 * @param input The input class maps
 * @return A combined class maps (combining CSS classes)
 */
var combineClassMaps = function () {
    var input = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        input[_i] = arguments[_i];
    }
    var combinedMap = {};
    input.forEach(function (classMap) {
        if (!classMap)
            return;
        Object.entries(classMap).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            if (!(k in combinedMap)) {
                combinedMap[k] = [v];
            }
            else {
                combinedMap[k].push(v);
            }
        });
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Typescript can't handle the partial class key map
    return Object.fromEntries(Object.entries(combinedMap).map(function (_a) {
        var k = _a[0], v = _a[1];
        return [k, v.join(" ")];
    }));
};
export default combineClassMaps;
