/**
 * Like useMemo, but supports async factory, triggers suspense while pending, comes with reset function
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @returns The value from the factory
 */
declare const useSuspendCache: <T>(factory: () => Promise<T> | T, dependencies: unknown[]) => {
    value: T;
    reset: () => void;
};
export default useSuspendCache;
