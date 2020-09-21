export type DebounceTargetFunc<ArgT extends Array<unknown>> = (
	...args: ArgT
) => void;

export default function debounce<ArgT extends Array<unknown>>(
	func: DebounceTargetFunc<ArgT>,
	timeout: number
): DebounceTargetFunc<ArgT> {
	let debounceState = 0;
	return (...args) => {
		if (debounceState !== 0) {
			window.clearTimeout(debounceState);
		}
		debounceState = window.setTimeout(() => func(...args), timeout);
	};
}
