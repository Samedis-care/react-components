import { useCallback } from "react";
import { useDepsDiffLog } from "./useMemoDebug";

/**
 * useCallback but logs which dependencies change for analysis
 * @param callback The useCallback callback (first param)
 * @param deps The useCallback dependency array (second param)
 * @param name The name for this debug (used for logging)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useCallbackDebug = <T extends (...args: any[]) => any>(
	callback: T,
	deps: unknown[],
	name?: string
): T => {
	useDepsDiffLog(deps, name ?? "useCallbackDebug");
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useCallback(callback, deps);
};

export default useCallbackDebug;
