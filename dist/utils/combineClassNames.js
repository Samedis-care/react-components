/**
 * Combines a list of class names for DOM usage
 * @param names The list of class names, may contain falsy values which are filtered
 * @remarks Falsy values are filtered, this is useful for conditional classes
 */
var combineClassNames = function (names) { return names.filter(function (e) { return !!e; }).join(" "); };
export default combineClassNames;
