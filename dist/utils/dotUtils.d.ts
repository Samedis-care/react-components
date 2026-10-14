export declare const dotToObject: (field: string, value: unknown) => Record<string, unknown>;
export declare const getValueByDot: (field: string, data: Record<string, unknown>) => unknown;
export declare const dotInObject: (field: string, data: Record<string, unknown>) => boolean;
/**
 * Flatten nested plain objects into a dot-notation record.
 * Everything else is a leaf and kept as it is: null, undefined, arrays,
 * empty objects and class instances (Date, Blob, ...).
 * @param obj The object to flatten
 */
export declare const objectToDots: (obj: Record<string, unknown>) => Record<string, unknown>;
export declare const dotsToObject: (dots: Record<string, unknown>) => Record<string, unknown>;
export declare const dotSet: (field: string, value: Record<string, unknown>, data: unknown) => Record<string, unknown>;
/**
 * Create a copy of data and omit all keys in omit list
 * @param data The data to copy
 * @param omit The keys to omit
 */
export declare const dotOmit: (data: Record<string, unknown>, omit: string[]) => Record<string, unknown>;
