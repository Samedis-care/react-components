import isPlainObject from "./isPlainObject";
/**
 * A recursive Object.assign: a plain object is merged into the plain object the target has under
 * its key, everything else is assigned as it is (also a plain object the target doesn't have, so
 * later merges write into it)
 * @param target The target object
 * @param sources The source object(s)
 * @returns The target object
 */
const deepAssign = (target, ...sources) => {
    for (const source of sources) {
        for (const key in source) {
            if (!Object.prototype.hasOwnProperty.call(source, key))
                continue;
            if (isPlainObject(source[key]) &&
                key in target &&
                isPlainObject(target[key])) {
                target[key] = deepAssign(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    }
    return target;
};
export default deepAssign;
