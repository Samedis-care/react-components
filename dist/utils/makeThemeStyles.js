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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import makeStyles from "@mui/styles/makeStyles";
import combineClassMaps from "./combineClassMaps";
/**
 * Calls makeStyles based on values from theme
 * @param getSubStyles A function to extract the values from the theme which should be used in makeStyles
 * @param name The name for the styles
 * @param useParentStyles The parent styles to override with theme styles
 */
var makeThemeStyles = function (getSubStyles, name, useParentStyles) {
    var useThemeStyles = makeStyles(function (theme) {
        var _a;
        var styleProvider = (_a = getSubStyles(theme)) !== null && _a !== void 0 ? _a : {};
        if (typeof styleProvider === "function") {
            return styleProvider(theme);
        }
        else {
            return styleProvider;
        }
    }, { name: name + "-ThemeStyles" });
    if (!useParentStyles) {
        return useThemeStyles;
    }
    var useCombinedStyles = function (props) {
        var _a = props, propClasses = _a.classes, otherProps = __rest(_a, ["classes"]);
        var themeClasses = useThemeStyles(otherProps);
        return useParentStyles(__assign(__assign({}, props), { classes: combineClassMaps(themeClasses, propClasses) }));
    };
    return useCombinedStyles;
};
export default makeThemeStyles;
