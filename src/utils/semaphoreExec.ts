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
async function semaphoreExec<T, R>(
	data: T[],
	maxConcurrent: number,
	executor: (record: T) => Promise<R>,
	progressCb?: (done: number, total: number) => void,
): Promise<[(R | undefined)[], (unknown | undefined)[]]> {
	const results: (R | undefined)[] = new Array<R>(data.length);
	const errors: (unknown | undefined)[] = new Array<unknown>(data.length);
	const inProgress: Promise<R>[] = [];
	let done = 0;
	for (let i = 0; i < data.length; ++i) {
		const recordIdx = i;
		const promise = executor(data[i]);
		promise
			.then((result) => (results[recordIdx] = result))
			.catch((error) => (errors[recordIdx] = error as unknown))
			.finally(() => {
				// remove from inProgress
				void inProgress.splice(
					inProgress.findIndex((listProm) => listProm === promise),
					1,
				);
				done++;
				if (progressCb) progressCb(done, data.length);
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
