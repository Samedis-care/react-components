/**
 * Like Object.assign, just with deep-copy capability
 * @param target The target object
 * @param sources The source object(s)
 * @returns The target object
 */
declare const deepAssign: (target: Record<string, unknown>, ...sources: Record<string, unknown>[]) => Record<string, unknown>;
export default deepAssign;
