import { useCallback, useEffect, useRef } from "react";
import { DebouncePromiseFunc, RejectT, ResolveT } from "./debouncePromise";
import { DebounceTargetFunc } from "./debounce";

export function useDebouncePromise<ArgT extends Array<unknown>, RetT>(
	func: DebouncePromiseFunc<ArgT, RetT>,
	timeout: number,
): [func: DebouncePromiseFunc<ArgT, RetT>, cancelDebounce: () => void] {
	const debounceState = useRef(0);
	const resolves = useRef<ResolveT<RetT>[]>([]);
	const rejects = useRef<RejectT[]>([]);

	const cancelDebounce = useCallback(() => {
		if (debounceState.current !== 0) {
			window.clearTimeout(debounceState.current);
			debounceState.current = 0;
		}
	}, []);

	useEffect(() => {
		return () => cancelDebounce();
	}, [cancelDebounce, func, timeout]);

	return [
		(...args) => {
			return new Promise((resolve, reject) => {
				cancelDebounce();
				resolves.current.push(resolve);
				rejects.current.push(reject);
				debounceState.current = window.setTimeout(() => {
					debounceState.current = 0;
					// hand the pending callers over to this invocation and start collecting
					// again, so a call made while it is still running waits for its own
					// invocation instead of getting this one's outdated result
					const invocationResolves = resolves.current;
					const invocationRejects = rejects.current;
					resolves.current = [];
					rejects.current = [];
					func(...args)
						.then((value) => {
							invocationResolves.forEach((cb) => cb(value));
						})
						.catch((value) => {
							invocationRejects.forEach((cb) => cb(value));
						});
				}, timeout);
			});
		},
		cancelDebounce,
	];
}

export function useDebounce<ArgT extends Array<unknown>>(
	func: DebounceTargetFunc<ArgT>,
	timeout: number,
): [func: DebounceTargetFunc<ArgT>, cancelDebounce: () => void] {
	const debounceState = useRef(0);
	const cancelDebounce = useCallback(() => {
		if (debounceState.current === 0) return;
		window.clearTimeout(debounceState.current);
		debounceState.current = 0;
	}, []);

	useEffect(() => {
		return () => cancelDebounce();
	}, [cancelDebounce, func, timeout]);

	return [
		(...args) => {
			cancelDebounce();
			debounceState.current = window.setTimeout(() => func(...args), timeout);
		},
		cancelDebounce,
	];
}
