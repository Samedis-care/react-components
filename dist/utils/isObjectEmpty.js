/**
 * Checks if the given object is empty (has no keys)
 * @param object The object to check
 */
const isObjectEmpty = (object) => {
    for (const key in object) {
        if (!Object.prototype.hasOwnProperty.call(object, key))
            continue;
        return false;
    }
    return true;
};
export default isObjectEmpty;
