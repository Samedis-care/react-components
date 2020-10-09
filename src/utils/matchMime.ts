/**
 * Matches a mime type to a mime type pattern
 * @param pattern The mime type pattern (e.g. "image/*")
 * @param actual The actual mime type to match (e.g. "image/jpg")
 * @returns true if actual matches pattern, otherwise false
 */
const matchMime = (pattern: string, actual: string): boolean => {
	// split the type into components
	const patternComponents = pattern.split("/").map((e) => e.toLowerCase());
	const actualComponents = actual.split("/").map((e) => e.toLowerCase());

	if (patternComponents.length !== actualComponents.length) return false;

	// match with wildcard support
	for (let i = 0; i < patternComponents.length; ++i) {
		if (patternComponents[i] === "*") continue;
		if (patternComponents[i] !== actualComponents[i]) return false;
	}

	return true;
};
export default matchMime;
