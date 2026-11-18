/**
 * What {@link useAsyncMemo} returns
 * @typeParam T What the factory resolves to
 */
export interface UseAsyncMemoResult<T> {
    /**
     * What the factory resolved to for the current dependencies, or `null` while
     * it runs and after it failed. With `keepPreviousResult`, the last result
     * stays in place of that `null`.
     */
    value: T | null;
    /**
     * Why the factory failed for the current dependencies: the reason it
     * rejected with, or what it threw. A reason that is not an `Error` is
     * wrapped in one, with the reason as its `cause`. `null` while the factory
     * runs and once it resolved; it is cleared when the dependencies change.
     */
    error: Error | null;
}
/**
 * Like useMemo, but supports async factory
 *
 * Only the result of the factory call for the current dependencies is used:
 * a call for dependencies which changed while it ran is dropped when it
 * settles, so it neither shows up in place of the current result nor
 * replaces it, and its rejection is not reported.
 *
 * A factory that rejects (or throws) for the current dependencies sets
 * `error`, so the caller can show the failure instead of waiting for a value
 * that never comes; the rejection is handled, never left unhandled. Changing
 * the dependencies runs the factory again.
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @param keepPreviousResult Keep the last result while the factory runs
 * for new dependencies, and after it failed for them. Default: false
 * @returns The factory's result (`value`, `null` while it is still
 * updating) and why it failed (`error`)
 */
declare const useAsyncMemo: <T>(factory: () => Promise<T> | T, dependencies: unknown[], keepPreviousResult?: boolean) => UseAsyncMemoResult<T>;
export default useAsyncMemo;
