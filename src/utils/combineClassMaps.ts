/**
 * Combines multiple class maps to a single one
 * @param input The input class maps
 * @return A combined class maps (combining CSS classes)
 */
const combineClassMaps = <ClassKey extends string = string>(
	...input: Partial<Record<ClassKey, string>>[]
): Partial<Record<ClassKey, string>> => {
	const combinedMap: Partial<Record<ClassKey, string[]>> = {};
	input.forEach((classMap) => {
		Object.entries(classMap).forEach(([k, v]) => {
			if (!(k in combinedMap)) {
				(combinedMap[k as ClassKey] as string[]) = [v as string];
			} else {
				(combinedMap[k as ClassKey] as string[]).push(v as string);
			}
		});
	});
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore Typescript can't handle the partial class key map
	return Object.fromEntries(
		Object.entries(combinedMap).map(([k, v]) => [k, (v as string[]).join(" ")])
	);
};
export default combineClassMaps;
