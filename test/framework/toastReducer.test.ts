import { describe, it, expect } from "vitest";
import {
	initialToastState,
	ToastConfig,
	toastReducer,
	ToastState,
} from "../../src/framework/toastReducer";

const first: ToastConfig = { severity: "success", message: "first" };
const second: ToastConfig = { severity: "error", message: "second" };
const third: ToastConfig = { severity: "info", message: "third" };

const showing = (toast: ToastConfig): ToastState =>
	toastReducer(initialToastState, { type: "show", toast });

describe("toastReducer", () => {
	it("shows a toast right away when none is shown", () => {
		expect(showing(first)).toEqual({ current: first, open: true, next: null });
	});

	it("closes the current toast before showing a new one", () => {
		const state = toastReducer(showing(first), { type: "show", toast: second });
		expect(state).toEqual({ current: first, open: false, next: second });
		expect(toastReducer(state, { type: "exited" })).toEqual({
			current: second,
			open: true,
			next: null,
		});
	});

	it("keeps only the newest toast while the current one closes", () => {
		let state = toastReducer(showing(first), { type: "show", toast: second });
		state = toastReducer(state, { type: "show", toast: third });
		expect(state).toEqual({ current: first, open: false, next: third });
		expect(toastReducer(state, { type: "exited" })).toEqual({
			current: third,
			open: true,
			next: null,
		});
	});

	it("keeps the toast mounted while it closes, then clears it", () => {
		const state = toastReducer(showing(first), { type: "close" });
		expect(state).toEqual({ current: first, open: false, next: null });
		expect(toastReducer(state, { type: "exited" })).toEqual(initialToastState);
	});

	it("drops a waiting toast when closed", () => {
		let state = toastReducer(showing(first), { type: "show", toast: second });
		state = toastReducer(state, { type: "close" });
		expect(state).toEqual({ current: first, open: false, next: null });
		expect(toastReducer(state, { type: "exited" })).toEqual(initialToastState);
	});

	it("ignores close when no toast is shown", () => {
		expect(toastReducer(initialToastState, { type: "close" })).toBe(
			initialToastState,
		);
	});
});
