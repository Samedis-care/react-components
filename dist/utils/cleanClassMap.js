/**
 * Filters the class names of a class map for warning-free usage
 * @param input The props with the class map
 * @param invert Invert the classes array (if true: remove all classes in classes, if false keep only classes in classes)
 * @param classes An array of (in)valid classes
 * @return The props with a cleaned class map
 */
const cleanClassMap = (input, invert, ...classes) => {
    if (!input.classes)
        return input;
    if (classes.length === 0) {
        if (invert) {
            return {
                ...input,
                classes: {},
            };
        }
        else {
            return input;
        }
    }
    return {
        ...input,
        classes: Object.fromEntries(Object.entries(input.classes).filter(([key]) => invert
            ? !classes.includes(key)
            : classes.includes(key))),
    };
};
export default cleanClassMap;
