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
 * Combine multiple useStyle hooks
 * @param props The properties to pass to the useStyle hooks
 * @param styles The useStyle hooks
 */
var useMultipleStyles = function (props) {
    var styles = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        styles[_i - 1] = arguments[_i];
    }
    var classes;
    styles.forEach(function (style) {
        classes = style(classes ? __assign(__assign({}, props), { classes: classes }) : props);
    });
    if (!classes)
        throw new Error("No styles to apply!");
    return classes;
};
export default useMultipleStyles;
