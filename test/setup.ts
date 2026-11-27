import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup, configure, getConfig } from "@testing-library/react";
import { unstable_NormalPriority, unstable_scheduleCallback } from "scheduler";

/**
 * Resolves once React's scheduler has run every task it had queued when this was called,
 * such as the effects of a commit made outside act(): the scheduler runs the tasks of a
 * priority in the order they were queued, and React queues that work at this priority.
 */
const reactSchedulerDrained = () =>
	new Promise<void>((resolve) => {
		unstable_scheduleCallback(unstable_NormalPriority, () => resolve());
	});

// waitFor and findBy* return on a setTimeout(0) once their condition is met, but React runs
// the effects of the commit that met it in a later task of its scheduler (a setImmediate).
// On a loaded machine the timer comes first, and the test goes on before those effects ran:
// a closed MUI dialog has left the DOM but not yet given the page back (aria-hidden, body
// styles). Testing Library's wrapper therefore also waits for React's queued work, while it
// still has React's act environment turned off.
const testingLibrary = getConfig();
configure({
	asyncWrapper: (cb) =>
		testingLibrary.asyncWrapper(async () => {
			const result: unknown = await cb();
			await reactSchedulerDrained();
			return result;
		}),
});

// Testing Library unmounts what a test rendered only when it finds a global afterEach,
// and the unit project runs without vitest's globals. Without this, a test's render stays
// mounted into the next tests of its file and past the file's end, where its late timers
// and loads run after the environment is gone ("window is not defined").
// A task React queued in its scheduler before the unmount (the effects of a commit made
// outside act()) still runs after it, in the next test or after the file's end, where it
// finds no window either: each test waits until React's scheduler has run them.
afterEach(async () => {
	cleanup();
	await reactSchedulerDrained();
});
