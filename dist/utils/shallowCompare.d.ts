/**
 * Compares two objects shallowly.
 * Useful for custom shouldComponentUpdate
 * @param obj1 Object 1
 * @param obj2 Object 2
 * @returns If these objects are equal on an base level
 */
declare const shallowCompare: (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => boolean;
export default shallowCompare;
