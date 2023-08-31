/**
 * Combines multiple class maps to a single one
 * @param input The input class maps
 * @return A combined class maps (combining CSS classes)
 */
const combineClassMaps = (...input) => {
    const combinedMap = {};
    input.forEach((classMap) => {
        if (!classMap)
            return;
        Object.entries(classMap).forEach(([k, v]) => {
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
    return Object.fromEntries(Object.entries(combinedMap).map(([k, v]) => [k, v.join(" ")]));
};
export default combineClassMaps;
