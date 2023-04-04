/**
 * Combines multiple class maps to a single one
 * @param input The input class maps
 * @return A combined class maps (combining CSS classes)
 */
declare const combineClassMaps: <ClassKey extends string = string>(...input: (Partial<Record<ClassKey, string>> | undefined)[]) => Partial<Record<ClassKey, string>>;
export default combineClassMaps;
