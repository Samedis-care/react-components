/**
 * useCallback but logs which dependencies change for analysis
 * @param callback The useCallback callback (first param)
 * @param deps The useCallback dependency array (second param)
 * @param name The name for this debug (used for logging)
 */
declare const useCallbackDebug: <T extends (...args: any[]) => any>(callback: T, deps: unknown[], name?: string | undefined) => T;
export default useCallbackDebug;
