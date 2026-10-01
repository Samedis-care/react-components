/**
 * Debounces a value, e.g. to use it as a query key or an effect dependency
 * @param value The value
 * @param delayMs How long the value has to stay unchanged
 * @param isEqual Tells if two values are the same, so a value rebuilt on every render doesn't
 * restart the timer. Default: by content (deepEqual, values it can't compare by identity)
 * @returns The initial value right away, then the latest value once it stayed unchanged for
 * delayMs. The returned object stays the same as long as its content does.
 */
declare const useDebouncedValue: <T>(value: T, delayMs: number, isEqual?: (a: T, b: T) => boolean) => T;
export default useDebouncedValue;
