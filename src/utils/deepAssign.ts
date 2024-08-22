import isPlainObject from "./isPlainObject";

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
				isPlainObject(source[key]) &&
				key in target &&
				isPlainObject(target[key])
			) {
				target[key] = deepAssign(target[key], source[key]);
			} else {
				target[key] = source[key];
			}
		}
	}
	return target;
};

export default deepAssign;
