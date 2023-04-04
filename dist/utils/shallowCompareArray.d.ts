/**
 * Compares two arrays shallowly.
 * Useful for custom shouldComponentUpdate
 * @param arr1 Array 1
 * @param arr2 Array 2
 * @returns If these arrays are equal on a base level
 */
declare const shallowCompareArray: (arr1: unknown[], arr2: unknown[]) => boolean;
export default shallowCompareArray;
