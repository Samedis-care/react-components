/**
 * Compares two arrays shallowly.
 * Useful for custom shouldComponentUpdate
 * @param arr1 Array 1
 * @param arr2 Array 2
 * @returns If these arrays are equal on a base level
 */
var shallowCompareArray = function (arr1, arr2) {
    return arr1.length === arr2.length &&
        arr1.filter(function (entry, idx) { return entry !== arr2[idx]; }).length === 0;
};
export default shallowCompareArray;
