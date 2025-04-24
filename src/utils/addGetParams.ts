/**
 * Adds the given query parameters to the given url
 * @param url The base url
 * @param args The query parameters
 * @private
 * @returns The url with query parameter
 */
const addGetParams = (
	url: string,
	args: Record<string, unknown> | null,
): string => {
	if (!args) {
		return url;
	}
	let argString = "";
	for (const key in args) {
		if (!Object.prototype.hasOwnProperty.call(args, key)) {
			continue;
		}

		const value = args[key];

		if (value === null || value === undefined) continue;

		if (Array.isArray(value)) {
			argString += (value as unknown[])
				.map(
					(entry: unknown): string =>
						"&" +
						encodeURIComponent(key + "[]") +
						"=" +
						encodeURIComponent(stringifyValue(entry)),
				)
				.join("");
		} else {
			argString +=
				"&" +
				encodeURIComponent(key) +
				"=" +
				encodeURIComponent(stringifyValue(value));
		}
	}

	return argString.length === 0 ? url : url + "?" + argString.substring(1);
};

const stringifyValue = (value: unknown): string => {
	if (typeof value === "string") {
		return value;
	} else if (typeof value === "number" || typeof value === "boolean") {
		return value.toString();
	} else if (typeof value === "object") {
		return JSON.stringify(value);
	} else {
		throw new Error("Unhandled type " + typeof value);
	}
};

export default addGetParams;
