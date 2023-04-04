/**
 * Compares if two arrays have the same content.
 * Useful for custom shouldComponentUpdate
 * @param arr1 Array 1
 * @param arr2 Array 2
 * @returns If these arrays contain the same elements in different order
 */
declare const compareArrayContent: (arr1: unknown[], arr2: unknown[]) => boolean;
export default compareArrayContent;
