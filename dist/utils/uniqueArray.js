/**
 * Gets the uniq elements from given array
 * @param array The array object
 */
var uniqueArray = function (array) {
    return array.filter(function (item, pos) {
        return array.indexOf(item) === pos;
    });
};
export var isUniqueArray = function (array) {
    return (array.find(function (item, pos) {
        return array.indexOf(item) !== pos;
    }) == null);
};
export default uniqueArray;
