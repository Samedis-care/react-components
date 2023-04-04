import { DebouncePromiseFunc } from "./debouncePromise";
import { DebounceTargetFunc } from "./debounce";
export declare function useDebouncePromise<ArgT extends Array<unknown>, RetT>(func: DebouncePromiseFunc<ArgT, RetT>, timeout: number): [func: DebouncePromiseFunc<ArgT, RetT>, cancelDebounce: () => void];
export declare function useDebounce<ArgT extends Array<unknown>>(func: DebounceTargetFunc<ArgT>, timeout: number): [func: DebounceTargetFunc<ArgT>, cancelDebounce: () => void];
