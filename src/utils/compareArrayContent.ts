/**
 * Compares if two arrays have the same content.
 * Useful for custom shouldComponentUpdate
 * @param arr1 Array 1
 * @param arr2 Array 2
 * @returns If these arrays contain the same elements in different order
 */
const compareArrayContent = (arr1: unknown[], arr2: unknown[]): boolean =>
	arr1.length === arr2.length &&
	arr1.filter((entry) => !arr2.find((e) => e === entry)).length === 0 &&
	arr2.filter((entry) => !arr1.find((e) => e === entry)).length === 0;

export default compareArrayContent;
