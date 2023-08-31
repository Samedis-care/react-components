export default function debouncePromise(func, timeout) {
    let debounceState = 0;
    // noinspection JSMismatchedCollectionQueryUpdate
    let resolves = [];
    // noinspection JSMismatchedCollectionQueryUpdate
    let rejects = [];
    return ((...args) => {
        return new Promise((resolve, reject) => {
            if (debounceState !== 0) {
                window.clearTimeout(debounceState);
            }
            resolves.push(resolve);
            rejects.push(reject);
            debounceState = window.setTimeout(() => {
                func(...args)
                    .then((value) => {
                    const resolvesOld = resolves;
                    resolves = [];
                    rejects = [];
                    resolvesOld.forEach((cb) => cb(value));
                })
                    .catch((value) => {
                    const rejectsOld = rejects;
                    resolves = [];
                    rejects = [];
                    rejectsOld.forEach((cb) => cb(value));
                });
            }, timeout);
        });
    });
}
