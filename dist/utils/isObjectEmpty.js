/**
 * Checks if the given object is empty (has no keys)
 * @param object The object to check
 */
var isObjectEmpty = function (object) {
    for (var key in object) {
        if (!Object.prototype.hasOwnProperty.call(object, key))
            continue;
        return false;
    }
    return true;
};
export default isObjectEmpty;
