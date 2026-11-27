// React's scheduler (a dependency of react-dom) ships no types. test/setup.ts imports it to
// wait for the work React queued in it, and uses only these.
declare module "scheduler" {
	export const unstable_NormalPriority: number;
	export function unstable_scheduleCallback(
		priorityLevel: number,
		callback: () => void,
	): unknown;
}
