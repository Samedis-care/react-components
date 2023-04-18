/**
 * Compares two objects shallowly.
 * Useful for custom shouldComponentUpdate
 * @param obj1 Object 1
 * @param obj2 Object 2
 * @returns If these objects are equal on an base level
 */
var shallowCompare = function (obj1, obj2) {
    return Object.keys(obj1).length === Object.keys(obj2).length &&
        Object.keys(obj1).every(function (key) {
            return Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] === obj2[key];
        });
};
export default shallowCompare;
