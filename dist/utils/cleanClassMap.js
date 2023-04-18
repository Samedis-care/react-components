var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * Filters the class names of a class map for warning-free usage
 * @param input The props with the class map
 * @param invert Invert the classes array (if true: remove all classes in classes, if false keep only classes in classes)
 * @param classes An array of (in)valid classes
 * @return The props with a cleaned class map
 */
var cleanClassMap = function (input, invert) {
    var classes = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        classes[_i - 2] = arguments[_i];
    }
    if (!input.classes)
        return input;
    if (classes.length === 0) {
        if (invert) {
            return __assign(__assign({}, input), { classes: {} });
        }
        else {
            return input;
        }
    }
    return __assign(__assign({}, input), { classes: Object.fromEntries(Object.entries(input.classes).filter(function (_a) {
            var key = _a[0];
            return invert
                ? !classes.includes(key)
                : classes.includes(key);
        })) });
};
export default cleanClassMap;
