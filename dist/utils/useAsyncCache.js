import { useCallback, useState } from "react";
import useAsyncMemo from "./useAsyncMemo";
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
const useAsyncCache = (factory, dependencies, keepPreviousResult = false) => {
    const [refreshKey, setRefreshKey] = useState(0);
    const reset = useCallback(() => setRefreshKey((prev) => (prev + 1) % 256), []);
    const { value, error } = useAsyncMemo(factory, [...dependencies, refreshKey], keepPreviousResult);
    return { value, error, reset };
};
export default useAsyncCache;
