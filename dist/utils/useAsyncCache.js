import { useCallback, useState } from "react";
import useAsyncMemo from "./useAsyncMemo";
/**
 * Like useMemo, but supports async factory and cache reset
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @param keepPreviousResult Cache previous results
 * @returns The value from the factory OR null while the factory is still updating
 */
const useAsyncCache = (factory, dependencies, keepPreviousResult = false) => {
    const [refreshKey, setRefreshKey] = useState(0);
    const reset = useCallback(() => setRefreshKey((prev) => (prev + 1) % 256), []);
    return {
        value: useAsyncMemo(factory, [...dependencies, refreshKey], keepPreviousResult),
        reset,
    };
};
export default useAsyncCache;
