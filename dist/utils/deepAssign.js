import { isPlainObject } from "./index";
/**
 * Like Object.assign, just with deep-copy capability
 * @param target The target object
 * @param sources The source object(s)
 * @returns The target object
 */
var deepAssign = function (target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        for (var key in source) {
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
