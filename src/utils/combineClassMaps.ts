/**
 * Combines multiple class maps to a single one
 * @param input The input class maps
 * @return A combined class maps (combining CSS classes)
 */
const combineClassMaps = (
	...input: Record<string, string>[]
): Record<string, string> => {
	const combinedMap: Record<string, string[]> = {};
	input.forEach((classMap) => {
		Object.entries(classMap).forEach(([k, v]) => {
			if (!(k in combinedMap)) {
				combinedMap[k] = [v];
			} else {
				combinedMap[k].push(v);
			}
		});
	});
	return Object.fromEntries(
		Object.entries(combinedMap).map(([k, v]) => [k, v.join(" ")])
	);
};
export default combineClassMaps;
