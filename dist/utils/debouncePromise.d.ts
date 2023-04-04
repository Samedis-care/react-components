export declare type DebouncePromiseFunc<ArgT extends Array<unknown>, RetT> = (...args: ArgT) => Promise<RetT>;
export declare type ResolveT<T> = (value: T | PromiseLike<T>) => void;
export declare type RejectT = (reason?: unknown) => void;
export default function debouncePromise<ArgT extends Array<unknown>, RetT>(func: DebouncePromiseFunc<ArgT, RetT>, timeout: number): DebouncePromiseFunc<ArgT, RetT>;
