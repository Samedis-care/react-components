export type DebouncePromiseFunc<ArgT extends Array<unknown>, RetT> = (
	...args: ArgT
) => Promise<RetT>;

export interface CancelableDebouncePromiseFunc<
	ArgT extends Array<unknown>,
	RetT,
> extends DebouncePromiseFunc<ArgT, RetT> {
	/**
	 * Drops the calls waiting for the timeout, if any: the function is not invoked for
	 * them, and their promises never settle. An invocation already running is not affected.
	 */
	cancel: () => void;
}

export type ResolveT<T> = (value: T | PromiseLike<T>) => void;
export type RejectT = (reason?: unknown) => void;

/**
 * Debounces an async function: calls within the timeout invoke it once, with the arguments
 * of the last call, and each of them gets that invocation's result
 * @param func The function to debounce
 * @param timeout The time in ms to wait after the last call, or a getter that is read at
 *        each call
 */
export default function debouncePromise<ArgT extends Array<unknown>, RetT>(
	func: DebouncePromiseFunc<ArgT, RetT>,
	timeout: number | (() => number),
): CancelableDebouncePromiseFunc<ArgT, RetT> {
	let debounceState = 0;
	// noinspection JSMismatchedCollectionQueryUpdate
	let resolves: ResolveT<RetT>[] = [];
	// noinspection JSMismatchedCollectionQueryUpdate
	let rejects: RejectT[] = [];

	const debounced = (...args: ArgT) => {
		return new Promise<RetT>((resolve, reject) => {
			if (debounceState !== 0) {
				window.clearTimeout(debounceState);
			}
			resolves.push(resolve);
			rejects.push(reject);
			debounceState = window.setTimeout(
				() => {
					debounceState = 0;
					// hand the pending callers over to this invocation and start collecting
					// again, so a call made while it is still running waits for its own
					// invocation instead of getting this one's outdated result
					const invocationResolves = resolves;
					const invocationRejects = rejects;
					resolves = [];
					rejects = [];
					func(...args)
						.then((value) => {
							invocationResolves.forEach((cb) => cb(value));
						})
						.catch((value) => {
							invocationRejects.forEach((cb) => cb(value));
						});
				},
				typeof timeout === "function" ? timeout() : timeout,
			);
		});
	};
	debounced.cancel = () => {
		if (debounceState !== 0) {
			window.clearTimeout(debounceState);
			debounceState = 0;
		}
		resolves = [];
		rejects = [];
	};
	return debounced;
}
