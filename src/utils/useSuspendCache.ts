import { useCallback, useState } from "react";
import useSuspendMemo from "./useSuspendMemo";

/**
 * Like useMemo, but supports async factory, triggers suspense while pending, comes with reset function
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @returns The value from the factory
 */
const useSuspendCache = <T>(
	factory: () => Promise<T> | T,
	dependencies: unknown[],
): { value: T; reset: () => void } => {
	const [resetKey, setResetKey] = useState(0);
	const value = useSuspendMemo(factory, [...dependencies, resetKey]);
	const reset = useCallback(() => setResetKey((prev) => prev + 1), []);
	return { value, reset };
};

export default useSuspendCache;
