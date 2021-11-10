/**
 * Deep clones data
 * @param source The data to clone
 * @returns The cloned object
 */
const deepClone = <T>(source: T): T => {
	return JSON.parse(JSON.stringify(source)) as T;
};

export default deepClone;
