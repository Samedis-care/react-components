export type DebounceTargetFunc = (...args: any[]) => void;

export default function debounce(
	func: DebounceTargetFunc,
	timeout: number
): DebounceTargetFunc {
	let debounceState = 0;
	return (...args) => {
		if (debounceState !== 0) {
			window.clearTimeout(debounceState);
		}
		debounceState = window.setTimeout(() => func(...args), timeout);
	};
}
