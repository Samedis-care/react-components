import { UseAsyncMemoResult } from "./useAsyncMemo";
/**
 * What {@link useAsyncCache} returns
 * @typeParam T What the factory resolves to
 */
export interface UseAsyncCacheResult<T> extends UseAsyncMemoResult<T> {
    /**
     * Runs the factory again, also when it failed. Clears `error`, and `value`
     * unless `keepPreviousResult` is set, until it settles.
     */
    reset: () => void;
}
/**
 * Like useMemo, but supports async factory and cache reset
 *
 * Handles failures like {@link useAsyncMemo}: a factory that rejects (or
 * throws) sets `error`, and `reset` runs it again.
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @param keepPreviousResult Keep the last result while the factory runs
 * again, and after it failed. Default: false
 * @returns The factory's result (`value`, `null` while it is still
 * updating), why it failed (`error`) and `reset`
 */
declare const useAsyncCache: <T>(factory: () => Promise<T> | T, dependencies: unknown[], keepPreviousResult?: boolean) => UseAsyncCacheResult<T>;
export default useAsyncCache;
