/**
 * Compares two arrays shallowly.
 * Useful for custom shouldComponentUpdate
 * @param arr1 Array 1
 * @param arr2 Array 2
 * @returns If these arrays are equal on a base level
 */
const shallowCompareArray = (arr1: unknown[], arr2: unknown[]): boolean =>
	arr1.length === arr2.length &&
	arr1.filter((entry, idx) => entry !== arr2[idx]).length === 0;

export default shallowCompareArray;
