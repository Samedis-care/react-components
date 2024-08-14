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
declare function semaphoreExec<T, R>(data: T[], maxConcurrent: number, executor: (record: T) => Promise<R>, progressCb?: (done: number, total: number) => void): Promise<[(R | undefined)[], (unknown | undefined)[]]>;
export default semaphoreExec;
