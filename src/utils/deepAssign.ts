/**
 * Like Object.assign, just with deep-copy capability
 * @param target The target object
 * @param sources The source object(s)
 * @returns The target object
 */
const deepAssign = (
	target: Record<string, unknown>,
	...sources: Record<string, unknown>[]
): Record<string, unknown> => {
	for (const source of sources) {
		for (const key in source) {
			if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
			if (
				typeof source[key] === "object" &&
				key in target &&
				typeof target[key] === "object"
			) {
				target[key] = deepAssign(
					target[key] as Record<string, unknown>,
					source[key] as Record<string, unknown>
				);
			} else {
				target[key] = source[key];
			}
		}
	}
	return target;
};

export default deepAssign;
