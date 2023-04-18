export default function debouncePromise(func, timeout) {
    var debounceState = 0;
    // noinspection JSMismatchedCollectionQueryUpdate
    var resolves = [];
    // noinspection JSMismatchedCollectionQueryUpdate
    var rejects = [];
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            if (debounceState !== 0) {
                window.clearTimeout(debounceState);
            }
            resolves.push(resolve);
            rejects.push(reject);
            debounceState = window.setTimeout(function () {
                func.apply(void 0, args).then(function (value) {
                    var resolvesOld = resolves;
                    resolves = [];
                    rejects = [];
                    resolvesOld.forEach(function (cb) { return cb(value); });
                })
                    .catch(function (value) {
                    var rejectsOld = rejects;
                    resolves = [];
                    rejects = [];
                    rejectsOld.forEach(function (cb) { return cb(value); });
                });
            }, timeout);
        });
    });
}
