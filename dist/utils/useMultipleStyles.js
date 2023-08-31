/**
 * Combine multiple useStyle hooks
 * @param props The properties to pass to the useStyle hooks
 * @param styles The useStyle hooks
 */
const useMultipleStyles = (props, ...styles) => {
    let classes;
    styles.forEach((style) => {
        classes = style(classes ? { ...props, classes } : props);
    });
    if (!classes)
        throw new Error("No styles to apply!");
    return classes;
};
export default useMultipleStyles;
