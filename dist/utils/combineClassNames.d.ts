/**
 * Combines a list of class names for DOM usage
 * @param names The list of class names, may contain falsy values which are filtered
 * @remarks Falsy values are filtered, this is useful for conditional classes
 */
declare const combineClassNames: (names: (string | false | undefined | null)[]) => string;
export default combineClassNames;
