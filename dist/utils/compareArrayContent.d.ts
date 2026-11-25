/**
 * Compares if two arrays have the same content: the same entries in any order,
 * each one as often in one array as in the other. Entries compare by identity
 * (SameValueZero, like Array.prototype.includes: NaN equals NaN, objects only
 * themselves), and falsy entries ("", 0, null, undefined, false) count like
 * any other.
 * Useful for custom shouldComponentUpdate
 * @param arr1 Array 1
 * @param arr2 Array 2
 * @returns true if arr2 is a reordering of arr1
 */
declare const compareArrayContent: (arr1: unknown[], arr2: unknown[]) => boolean;
export default compareArrayContent;
