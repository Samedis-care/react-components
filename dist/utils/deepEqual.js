import shallowCompareArray from "./shallowCompareArray";
import isPlainObject from "./isPlainObject";
const deepEqual = (a, b) => {
    // check if same type
    if (typeof a !== typeof b)
        return false;
    // special handling null / undefined
    if (a == null || b == null) {
        return (a == null) === (b == null);
    }
    // special handling date
    if (a instanceof Date || b instanceof Date) {
        // ensure data types
        if (!(a instanceof Date && b instanceof Date))
            return false;
        // check if unix timestamp matches as instance comparison does not work
        return a.getTime() === b.getTime();
    }
    // special handling array
    if (Array.isArray(a)) {
        // ensure data types
        if (!(Array.isArray(a) && Array.isArray(b)))
            return false;
        return shallowCompareArray(a, b);
    }
    // special handing for nested objects
    if (isPlainObject(a) || isPlainObject(b)) {
        // ensure data types
        if (!(isPlainObject(a) && isPlainObject(b)))
            return false;
        // check keys equal
        if (!shallowCompareArray(Object.keys(a).sort(), Object.keys(b).sort()))
            return false;
        // check all sub-values to be equal
        return Object.keys(a).find((key) => !deepEqual(a[key], b[key])) == null;
    }
    // fallback comparison
    if (typeof a !== "string" && typeof a !== "number")
        throw new Error("Unsupported data type");
    return a === b;
};
export default deepEqual;
