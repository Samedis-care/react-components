type DebouncePromiseFunc = (...args: any[]) => Promise<any>;

export default function debouncePromise<Func extends DebouncePromiseFunc>(
	func: Func,
	timeout: number
): Func {
	let debounceState = 0;
	// @ts-ignore TypeScript gets confused with this level of generic functions, so we just ignore it here. The function prototype is important
	return (...args) => {
		return new Promise((resolve, reject) => {
			if (debounceState !== 0) {
				window.clearTimeout(debounceState);
			}
			debounceState = window.setTimeout(
				() =>
					func(...args)
						.then(resolve)
						.catch(reject),
				timeout
			);
		});
	};
}
