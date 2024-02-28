export type DebounceTargetFunc<ArgT extends Array<unknown>> = (...args: ArgT) => void;
export default function debounce<ArgT extends Array<unknown>>(func: DebounceTargetFunc<ArgT>, timeout: number): DebounceTargetFunc<ArgT>;
