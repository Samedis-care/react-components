import { useRef } from "react";
const useSuspend = (promise) => {
    const value = useRef(null);
    if (typeof promise !== "object" ||
        promise == null ||
        !("then" in promise) ||
        typeof promise.then !== "function")
        return promise;
    promise
        .then((v) => (value.current = { value: v }))
        .catch((e) => (value.current = { error: e }));
    if (!value.current)
        throw promise;
    else if (value.current.value)
        return value.current.value;
    else
        throw value.current.error;
};
export default useSuspend;
