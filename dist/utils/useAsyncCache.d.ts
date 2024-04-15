/**
 * Like useMemo, but supports async factory and cache reset
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @param keepPreviousResult Cache previous results
 * @returns The value from the factory OR null while the factory is still updating
 */
declare const useAsyncCache: <T>(factory: () => Promise<T> | T, dependencies: unknown[], keepPreviousResult?: boolean) => {
    value: T | null;
    reset: () => void;
};
export default useAsyncCache;
