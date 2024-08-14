/**
 * Runs the executor on the data provided with maxConcurrent promises concurrently
 * @param data The data to execute on
 * @param maxConcurrent The maximum amount of workers
 * @param executor The executor function
 * @param progressCb Optional progress callback, will be called after each item done, make sure it's fast.
 * @return A promise with a tuple of results (first element) and errors (second element).
 * The result and error arrays may contain undefined elements, but for the same index one of them will be defined.
 * Example:
 * results: [result1, undefined, result3]
 * errors: [undefined, error2, undefined]
 */
async function semaphoreExec(data, maxConcurrent, executor, progressCb) {
    const results = new Array(data.length);
    const errors = new Array(data.length);
    const inProgress = [];
    let done = 0;
    for (let i = 0; i < data.length; ++i) {
        const recordIdx = i;
        const promise = executor(data[i]);
        promise
            .then((result) => (results[recordIdx] = result))
            .catch((error) => (errors[recordIdx] = error))
            .finally(() => {
            // remove from inProgress
            void inProgress.splice(inProgress.findIndex((listProm) => listProm === promise), 1);
            done++;
            if (progressCb)
                progressCb(done, data.length);
        });
        inProgress.push(promise);
        while (inProgress.length >= maxConcurrent) {
            await Promise.race(inProgress);
        }
    }
    await Promise.all(inProgress);
    return [results, errors];
}
export default semaphoreExec;
