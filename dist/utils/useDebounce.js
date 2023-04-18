import { useCallback, useEffect, useRef } from "react";
export function useDebouncePromise(func, timeout) {
    var debounceState = useRef(0);
    var resolves = useRef([]);
    var rejects = useRef([]);
    var cancelDebounce = useCallback(function () {
        if (debounceState.current !== 0) {
            window.clearTimeout(debounceState.current);
            debounceState.current = 0;
        }
    }, []);
    useEffect(function () {
        return function () { return cancelDebounce(); };
    }, [cancelDebounce, func, timeout]);
    return [
        (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new Promise(function (resolve, reject) {
                cancelDebounce();
                resolves.current.push(resolve);
                rejects.current.push(reject);
                debounceState.current = window.setTimeout(function () {
                    func.apply(void 0, args).then(function (value) {
                        var resolvesOld = resolves.current;
                        resolves.current = [];
                        rejects.current = [];
                        resolvesOld.forEach(function (cb) { return cb(value); });
                    })
                        .catch(function (value) {
                        var rejectsOld = rejects.current;
                        resolves.current = [];
                        rejects.current = [];
                        rejectsOld.forEach(function (cb) { return cb(value); });
                    });
                }, timeout);
            });
        }),
        cancelDebounce,
    ];
}
export function useDebounce(func, timeout) {
    var debounceState = useRef(0);
    var cancelDebounce = useCallback(function () {
        if (debounceState.current === 0)
            return;
        window.clearTimeout(debounceState.current);
        debounceState.current = 0;
    }, []);
    useEffect(function () {
        return function () { return cancelDebounce(); };
    }, [cancelDebounce, func, timeout]);
    return [
        function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            cancelDebounce();
            debounceState.current = window.setTimeout(function () { return func.apply(void 0, args); }, timeout);
        },
        cancelDebounce,
    ];
}
