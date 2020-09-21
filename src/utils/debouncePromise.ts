type DebouncePromiseFunc<ArgT extends Array<unknown>, RetT> = (
	...args: ArgT
) => Promise<RetT>;

export default function debouncePromise<ArgT extends Array<unknown>, RetT>(
	func: DebouncePromiseFunc<ArgT, RetT>,
	timeout: number
): DebouncePromiseFunc<ArgT, RetT> {
	let debounceState = 0;
	return ((...args) => {
		return new Promise((resolve, reject) => {
			if (debounceState !== 0) {
				window.clearTimeout(debounceState);
			}
			debounceState = window.setTimeout(() => {
				func(...args)
					.then(resolve)
					.catch(reject);
			}, timeout);
		});
	}) as DebouncePromiseFunc<ArgT, RetT>;
}
