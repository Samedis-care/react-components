import { useRef } from "react";

const useSuspend = <T>(promise: T): Awaited<T> => {
	const value = useRef<{ value?: T; error?: unknown } | null>(null);
	if (
		typeof promise !== "object" ||
		promise == null ||
		!("then" in promise) ||
		typeof promise.then !== "function"
	)
		return promise as Awaited<T>;
	(promise as unknown as Promise<T>)
		.then((v) => (value.current = { value: v }))
		.catch((e) => (value.current = { error: e }));
	if (!value.current) throw promise;
	else if (value.current.value) return value.current.value as Awaited<T>;
	else throw value.current.error;
};

export default useSuspend;
