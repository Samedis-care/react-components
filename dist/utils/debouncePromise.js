export default function debouncePromise(func, timeout) {
    let debounceState = 0;
    // noinspection JSMismatchedCollectionQueryUpdate
    let resolves = [];
    // noinspection JSMismatchedCollectionQueryUpdate
    let rejects = [];
    return (...args) => {
        return new Promise((resolve, reject) => {
            if (debounceState !== 0) {
                window.clearTimeout(debounceState);
            }
            resolves.push(resolve);
            rejects.push(reject);
            debounceState = window.setTimeout(() => {
                debounceState = 0;
                // hand the pending callers over to this invocation and start collecting
                // again, so a call made while it is still running waits for its own
                // invocation instead of getting this one's outdated result
                const invocationResolves = resolves;
                const invocationRejects = rejects;
                resolves = [];
                rejects = [];
                func(...args)
                    .then((value) => {
                    invocationResolves.forEach((cb) => cb(value));
                })
                    .catch((value) => {
                    invocationRejects.forEach((cb) => cb(value));
                });
            }, timeout);
        });
    };
}
