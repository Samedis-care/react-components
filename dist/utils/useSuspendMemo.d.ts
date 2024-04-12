/**
 * Like useMemo, but supports async factory, triggers suspense while pending
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @returns The value from the factory
 */
declare const useSuspendMemo: <T>(factory: () => Promise<T> | T, dependencies: unknown[]) => T;
export default useSuspendMemo;
