export type DebounceTargetFunc<ArgT extends Array<unknown>> = (
	...args: ArgT
) => void;

export interface CancelableDebounceFunc<
	ArgT extends Array<unknown>,
> extends DebounceTargetFunc<ArgT> {
	/**
	 * Drops the call waiting for the timeout, if any: the function is not invoked for it.
	 * An invocation that already ran is not affected, and later calls are debounced as before.
	 */
	cancel: () => void;
}

/**
 * Debounces a function: calls within the timeout invoke it once, with the arguments of the
 * last call
 * @param func The function to debounce
 * @param timeout The time in ms to wait after the last call
 */
export default function debounce<ArgT extends Array<unknown>>(
	func: DebounceTargetFunc<ArgT>,
	timeout: number,
): CancelableDebounceFunc<ArgT> {
	let debounceState = 0;
	const debounced = (...args: ArgT) => {
		if (debounceState !== 0) {
			window.clearTimeout(debounceState);
		}
		debounceState = window.setTimeout(() => {
			debounceState = 0;
			func(...args);
		}, timeout);
	};
	debounced.cancel = () => {
		if (debounceState === 0) return;
		window.clearTimeout(debounceState);
		debounceState = 0;
	};
	return debounced;
}
