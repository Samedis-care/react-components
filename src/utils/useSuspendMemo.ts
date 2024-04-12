import { useMemo } from "react";
import useSuspend from "./useSuspend";

/**
 * Like useMemo, but supports async factory, triggers suspense while pending
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @returns The value from the factory
 */
const useSuspendMemo = <T>(
	factory: () => Promise<T> | T,
	dependencies: unknown[],
): T => {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const promise = useMemo(factory, dependencies);
	return useSuspend(promise);
};

export default useSuspendMemo;
