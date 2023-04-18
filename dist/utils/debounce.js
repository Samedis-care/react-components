export default function debounce(func, timeout) {
    var debounceState = 0;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (debounceState !== 0) {
            window.clearTimeout(debounceState);
        }
        debounceState = window.setTimeout(function () { return func.apply(void 0, args); }, timeout);
    };
}
