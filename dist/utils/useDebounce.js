import { useCallback, useEffect, useRef } from "react";
export function useDebouncePromise(func, timeout) {
    const debounceState = useRef(0);
    const resolves = useRef([]);
    const rejects = useRef([]);
    const cancelDebounce = useCallback(() => {
        if (debounceState.current !== 0) {
            window.clearTimeout(debounceState.current);
            debounceState.current = 0;
        }
    }, []);
    useEffect(() => {
        return () => cancelDebounce();
    }, [cancelDebounce, func, timeout]);
    return [
        ((...args) => {
            return new Promise((resolve, reject) => {
                cancelDebounce();
                resolves.current.push(resolve);
                rejects.current.push(reject);
                debounceState.current = window.setTimeout(() => {
                    func(...args)
                        .then((value) => {
                        const resolvesOld = resolves.current;
                        resolves.current = [];
                        rejects.current = [];
                        resolvesOld.forEach((cb) => cb(value));
                    })
                        .catch((value) => {
                        const rejectsOld = rejects.current;
                        resolves.current = [];
                        rejects.current = [];
                        rejectsOld.forEach((cb) => cb(value));
                    });
                }, timeout);
            });
        }),
        cancelDebounce,
    ];
}
export function useDebounce(func, timeout) {
    const debounceState = useRef(0);
    const cancelDebounce = useCallback(() => {
        if (debounceState.current === 0)
            return;
        window.clearTimeout(debounceState.current);
        debounceState.current = 0;
    }, []);
    useEffect(() => {
        return () => cancelDebounce();
    }, [cancelDebounce, func, timeout]);
    return [
        (...args) => {
            cancelDebounce();
            debounceState.current = window.setTimeout(() => func(...args), timeout);
        },
        cancelDebounce,
    ];
}
