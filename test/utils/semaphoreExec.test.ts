import { describe, it, expect, vi } from "vitest";
import semaphoreExec from "../../src/utils/semaphoreExec";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("semaphoreExec", () => {
	it("returns the results in record order", async () => {
		const [results, errors] = await semaphoreExec([1, 2, 3, 4], 2, (n) =>
			sleep(5 - n).then(() => n * 10),
		);

		expect(results).toEqual([10, 20, 30, 40]);
		expect(errors.filter((error) => error !== undefined)).toEqual([]);
	});

	it.each([
		{ count: 1, failAt: [0] },
		{ count: 5, failAt: [2] },
		{ count: 25, failAt: [3] },
		{ count: 25, failAt: [17] },
		{ count: 25, failAt: [24] },
		{ count: 25, failAt: [0, 9, 10, 24] },
	])(
		"runs all $count records and returns the errors of $failAt",
		async ({ count, failAt }) => {
			const executor = vi.fn((n: number) =>
				sleep(1 + (n % 3)).then(() => {
					if (failAt.includes(n)) throw new Error(`fail ${n}`);
					return n;
				}),
			);

			const [results, errors] = await semaphoreExec(
				Array.from({ length: count }, (_, n) => n),
				10,
				executor,
			);

			expect(executor).toHaveBeenCalledTimes(count);
			for (let n = 0; n < count; ++n) {
				if (failAt.includes(n)) {
					expect(results[n]).toBeUndefined();
					expect((errors[n] as Error).message).toBe(`fail ${n}`);
				} else {
					expect(results[n]).toBe(n);
					expect(errors[n]).toBeUndefined();
				}
			}
		},
	);

	it("catches an executor that throws instead of rejecting", async () => {
		const error = new Error("sync");
		const [results, errors] = await semaphoreExec([1, 2], 2, (n) => {
			if (n === 1) throw error;
			return Promise.resolve(n);
		});

		expect(results).toEqual([undefined, 2]);
		expect(errors[0]).toBe(error);
	});

	it("never runs more than maxConcurrent records at once", async () => {
		let running = 0;
		let maxRunning = 0;
		await semaphoreExec(
			Array.from({ length: 20 }, (_, n) => n),
			3,
			async (n) => {
				running++;
				maxRunning = Math.max(maxRunning, running);
				await sleep(1 + (n % 4));
				running--;
				if (n % 5 === 0) throw new Error("fail");
			},
		);

		expect(maxRunning).toBe(3);
	});

	it("reports progress for successful and failed records", async () => {
		const progressCb = vi.fn();
		await semaphoreExec(
			[1, 2, 3],
			2,
			(n) => (n === 2 ? Promise.reject(new Error("fail")) : Promise.resolve(n)),
			progressCb,
		);

		expect(progressCb.mock.calls).toEqual([
			[1, 3],
			[2, 3],
			[3, 3],
		]);
	});

	it("resolves for no records", async () => {
		const executor = vi.fn(() => Promise.resolve());
		expect(await semaphoreExec([], 5, executor)).toEqual([[], []]);
		expect(executor).not.toHaveBeenCalled();
	});
});
