import { useEffect, useMemo, useRef } from "react";

/**
 * useMemo but logs which dependencies change for analysis
 * @param factory The useMemo factory (first param)
 * @param deps The useMemo dependency array (second param)
 * @param name The name for this debug (used for logging)
 */
const useMemoDebug = <T>(
	factory: () => T,
	deps: unknown[],
	name: string
): T => {
	const prev = useRef<unknown[]>(deps);
	useEffect(() => {
		if (prev.current.length !== deps.length) {
			// eslint-disable-next-line no-console
			console.log(
				`[useMemoDebug] [${name}] array length mismatch`,
				prev.current,
				deps
			);
		} else {
			for (let i = 0; i < deps.length; ++i) {
				if (prev.current[i] !== deps[i]) {
					// eslint-disable-next-line no-console
					console.log(
						`[useMemoDebug] [${name}] dependency ${i} mismatch`,
						prev.current[i],
						deps[i],
						"complete deps:",
						prev.current,
						deps
					);
				}
			}
		}
		prev.current = deps;
	}, [deps, name]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(factory, deps);
};

export default useMemoDebug;
