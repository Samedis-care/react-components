/**
 * Compares if two arrays have the same content.
 * Useful for custom shouldComponentUpdate
 * @param arr1 Array 1
 * @param arr2 Array 2
 * @returns If these arrays contain the same elements in different order
 */
var compareArrayContent = function (arr1, arr2) {
    return arr1.length === arr2.length &&
        arr1.filter(function (entry) { return !arr2.find(function (e) { return e === entry; }); }).length === 0 &&
        arr2.filter(function (entry) { return !arr1.find(function (e) { return e === entry; }); }).length === 0;
};
export default compareArrayContent;
