export declare const dotToObject: (field: string, value: unknown) => Record<string, unknown>;
export declare const getValueByDot: (field: string, data: Record<string, unknown>) => unknown;
export declare const dotInObject: (field: string, data: Record<string, unknown>) => boolean;
export declare const objectToDots: (obj: Record<string, unknown>) => Record<string, unknown>;
export declare const dotsToObject: (dots: Record<string, unknown>) => Record<string, unknown>;
export declare const dotSet: (field: string, value: Record<string, unknown>, data: unknown) => Record<string, unknown>;
/**
 * Create a copy of data and omit all keys in omit list
 * @param data The data to copy
 * @param omit The keys to omit
 */
export declare const dotOmit: (data: Record<string, unknown>, omit: string[]) => Record<string, unknown>;
