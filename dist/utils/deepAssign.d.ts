/**
 * A recursive Object.assign: a plain object is merged into the plain object the target has under
 * its key, everything else is assigned as it is (also a plain object the target doesn't have, so
 * later merges write into it)
 * @param target The target object
 * @param sources The source object(s)
 * @returns The target object
 */
declare const deepAssign: (target: Record<string, unknown>, ...sources: Record<string, unknown>[]) => Record<string, unknown>;
export default deepAssign;
