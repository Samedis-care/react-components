export declare const useDepsDiffLog: (deps: unknown[], name: string) => void;
/**
 * useMemo but logs which dependencies change for analysis
 * @param factory The useMemo factory (first param)
 * @param deps The useMemo dependency array (second param)
 * @param name The name for this debug (used for logging)
 */
declare const useMemoDebug: <T>(factory: () => T, deps: unknown[], name?: string | undefined) => T;
export default useMemoDebug;
