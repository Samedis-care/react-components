type DebouncePromiseFunc<ArgT extends Array<unknown>, RetT> = (
	...args: ArgT
) => Promise<RetT>;

export type ResolveT<T> = (value: T | PromiseLike<T>) => void;
export type RejectT = (reason?: unknown) => void;

export default function debouncePromise<ArgT extends Array<unknown>, RetT>(
	func: DebouncePromiseFunc<ArgT, RetT>,
	timeout: number
): DebouncePromiseFunc<ArgT, RetT> {
	let debounceState = 0;
	// noinspection JSMismatchedCollectionQueryUpdate
	let resolves: ResolveT<RetT>[] = [];
	// noinspection JSMismatchedCollectionQueryUpdate
	let rejects: RejectT[] = [];

	return ((...args) => {
		return new Promise((resolve, reject) => {
			if (debounceState !== 0) {
				window.clearTimeout(debounceState);
			}
			resolves.push(resolve);
			rejects.push(reject);
			debounceState = window.setTimeout(() => {
				func(...args)
					.then((value) => {
						const resolvesOld = resolves;
						resolves = [];
						rejects = [];
						resolvesOld.forEach((cb) => cb(value));
					})
					.catch((value) => {
						const rejectsOld = rejects;
						resolves = [];
						rejects = [];
						rejectsOld.forEach((cb) => cb(value));
					});
			}, timeout);
		});
	}) as DebouncePromiseFunc<ArgT, RetT>;
}
