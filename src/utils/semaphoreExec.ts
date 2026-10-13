/**
 * Runs the executor on the data provided with maxConcurrent promises concurrently
 * @param data The data to execute on
 * @param maxConcurrent The maximum amount of workers
 * @param executor The executor function
 * @param progressCb Optional progress callback, will be called after each item done, make sure it's fast.
 * @return A promise with a tuple of results (first element) and errors (second element).
 * Every record is executed, an executor error does not reject the promise but ends up in the errors array.
 * The result and error arrays may contain undefined elements, but for the same index one of them will be defined.
 * Example:
 * results: [result1, undefined, result3]
 * errors: [undefined, error2, undefined]
 */
async function semaphoreExec<T, R>(
	data: T[],
	maxConcurrent: number,
	executor: (record: T) => Promise<R>,
	progressCb?: (done: number, total: number) => void,
): Promise<[(R | undefined)[], (unknown | undefined)[]]> {
	const results: (R | undefined)[] = new Array<R>(data.length);
	const errors: (unknown | undefined)[] = new Array<unknown>(data.length);
	let next = 0;
	let done = 0;
	// each worker takes the next record until none are left, an executor error only ends its record
	const worker = async () => {
		while (next < data.length) {
			const recordIdx = next++;
			try {
				results[recordIdx] = await executor(data[recordIdx]);
			} catch (error) {
				errors[recordIdx] = error;
			}
			done++;
			if (progressCb) progressCb(done, data.length);
		}
	};
	const workerCount = Math.max(1, Math.min(maxConcurrent, data.length));
	await Promise.all(Array.from({ length: workerCount }, worker));
	return [results, errors];
}

export default semaphoreExec;
