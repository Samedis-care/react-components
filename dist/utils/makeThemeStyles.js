import makeStyles from "@mui/styles/makeStyles";
import combineClassMaps from "./combineClassMaps";
/**
 * Calls makeStyles based on values from theme
 * @param getSubStyles A function to extract the values from the theme which should be used in makeStyles
 * @param name The name for the styles
 * @param useParentStyles The parent styles to override with theme styles
 */
const makeThemeStyles = (getSubStyles, name, useParentStyles) => {
    const useThemeStyles = makeStyles((theme) => {
        const styleProvider = getSubStyles(theme) ?? {};
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
    const useCombinedStyles = (props) => {
        const { classes: propClasses, ...otherProps } = props;
        const themeClasses = useThemeStyles(otherProps);
        return useParentStyles({
            ...props,
            classes: combineClassMaps(themeClasses, propClasses),
        });
    };
    return useCombinedStyles;
};
export default makeThemeStyles;
