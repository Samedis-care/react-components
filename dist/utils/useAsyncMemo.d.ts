/**
 * Like useMemo, but supports async factory
 *
 * Only the result of the factory call for the current dependencies is used:
 * a call for dependencies which changed while it ran is dropped when it
 * resolves, so it neither shows up in place of the current result nor
 * replaces it.
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @param keepPreviousResult Cache previous results
 * @returns The value from the factory OR null while the factory is still updating
 */
declare const useAsyncMemo: <T>(factory: () => Promise<T> | T, dependencies: unknown[], keepPreviousResult?: boolean) => T | null;
export default useAsyncMemo;
