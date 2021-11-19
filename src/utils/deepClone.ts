/**
 * Deep clones data
 * @param item The data to clone
 * @returns The cloned object
 */
const deepClone = <T>(item: T): T => {
	// source: https://stackoverflow.com/a/4460624 (license: CC BY-SA 4.0)
	// modified to work with TypeScript
	if (!item) {
		return item;
	} // null, undefined values check

	const types = [Number, String, Boolean];
	let result: unknown;

	// normalizing primitives if someone did new String('aaa'), or new Number('444');
	types.forEach(function (type) {
		if (item instanceof type) {
			result = type(item);
		}
	});

	if (typeof result == "undefined") {
		if (Array.isArray(item)) {
			result = [];
			item.forEach((child, index) => {
				(result as Record<string, unknown>)[index] = deepClone(child);
			});
		} else if (typeof item == "object") {
			// testing that this is DOM
			if (
				"nodeType" in item &&
				(item as Record<string, unknown>).nodeType &&
				"cloneType" in item &&
				typeof (item as Record<string, unknown>).cloneNode == "function"
			) {
				result = ((item as unknown) as HTMLElement).cloneNode(true);
			} else if (
				!("prototype" in item) ||
				!(item as Record<string, unknown>).prototype
			) {
				// check that this is a literal
				if (item instanceof Date) {
					result = new Date(item);
				} else {
					// it is an object literal
					result = {};
					for (const i in item) {
						(result as Record<string, unknown>)[i] = deepClone(item[i]);
					}
				}
			} else {
				result = item;
			}
		} else {
			result = item;
		}
	}

	return result as T;
};

export default deepClone;
