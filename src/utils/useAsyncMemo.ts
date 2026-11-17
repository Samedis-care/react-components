import { useEffect, useState } from "react";

/**
 * What {@link useAsyncMemo} returns
 * @typeParam T What the factory resolves to
 */
export interface UseAsyncMemoResult<T> {
	/**
	 * What the factory resolved to for the current dependencies, or `null` while
	 * it runs and after it failed. With `keepPreviousResult`, the last result
	 * stays in place of that `null`.
	 */
	value: T | null;
	/**
	 * Why the factory failed for the current dependencies: the reason it
	 * rejected with, or what it threw. A reason that is not an `Error` is
	 * wrapped in one, with the reason as its `cause`. `null` while the factory
	 * runs and once it resolved; it is cleared when the dependencies change.
	 */
	error: Error | null;
}

const INITIAL_RESULT: UseAsyncMemoResult<never> = { value: null, error: null };

const toError = (reason: unknown): Error =>
	reason instanceof Error
		? reason
		: new Error(String(reason), { cause: reason });

/**
 * Like useMemo, but supports async factory
 *
 * Only the result of the factory call for the current dependencies is used:
 * a call for dependencies which changed while it ran is dropped when it
 * settles, so it neither shows up in place of the current result nor
 * replaces it, and its rejection is not reported.
 *
 * A factory that rejects (or throws) for the current dependencies sets
 * `error`, so the caller can show the failure instead of waiting for a value
 * that never comes; the rejection is handled, never left unhandled. Changing
 * the dependencies runs the factory again.
 * @param factory The value factory
 * @param dependencies The dependencies of the memo
 * @param keepPreviousResult Keep the last result while the factory runs
 * for new dependencies, and after it failed for them. Default: false
 * @returns The factory's result (`value`, `null` while it is still
 * updating) and why it failed (`error`)
 */
const useAsyncMemo = <T>(
	factory: () => Promise<T> | T,
	dependencies: unknown[],
	keepPreviousResult = false,
): UseAsyncMemoResult<T> => {
	const [state, setState] = useState<UseAsyncMemoResult<T>>(INITIAL_RESULT);

	useEffect(() => {
		let current = true;
		setState((prev) => {
			const value = keepPreviousResult ? prev.value : null;
			return prev.value === value && prev.error === null
				? prev
				: { value, error: null };
		});
		void (async () => {
			try {
				const value = await factory();
				if (current) setState({ value, error: null });
			} catch (reason) {
				if (!current) return;
				const error = toError(reason);
				// the value is null here, or with keepPreviousResult the last result
				setState((prev) => ({ value: prev.value, error }));
			}
		})();
		return () => {
			current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);

	return state;
};

export default useAsyncMemo;
