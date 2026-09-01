import { describe, it, expect, vi } from "vitest";
import TypedEventTarget from "../../src/utils/TypedEventTarget";

interface TestEvents extends Record<string, unknown> {
	ping: { value: number };
	pong: { value: string };
}

describe("TypedEventTarget", () => {
	it("dispatches to every listener of the type and to no other", () => {
		const target = new TypedEventTarget<TestEvents>();
		const ping1 = vi.fn();
		const ping2 = vi.fn();
		const pong = vi.fn();
		target.addEventListener("ping", ping1);
		target.addEventListener("ping", ping2);
		target.addEventListener("pong", pong);

		target.dispatchEvent("ping", { value: 42 });

		expect(ping1).toHaveBeenCalledWith({ value: 42 });
		expect(ping2).toHaveBeenCalledWith({ value: 42 });
		expect(pong).not.toHaveBeenCalled();
	});

	it("registers a listener once and removes it again", () => {
		const target = new TypedEventTarget<TestEvents>();
		const listener = vi.fn();
		target.addEventListener("ping", listener);
		target.addEventListener("ping", listener);

		target.dispatchEvent("ping", { value: 1 });
		expect(listener).toHaveBeenCalledTimes(1);

		target.removeEventListener("ping", listener);
		target.dispatchEvent("ping", { value: 2 });
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("keeps dispatching when a listener unsubscribes itself or throws", () => {
		const target = new TypedEventTarget<TestEvents>();
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		const last = vi.fn();
		const selfRemoving = vi.fn(() =>
			target.removeEventListener("ping", selfRemoving),
		);
		const throwing = vi.fn(() => {
			throw new Error("listener is broken");
		});
		target.addEventListener("ping", selfRemoving);
		target.addEventListener("ping", throwing);
		target.addEventListener("ping", last);

		expect(() => target.dispatchEvent("ping", { value: 1 })).not.toThrow();
		expect(last).toHaveBeenCalledTimes(1);
		expect(consoleError).toHaveBeenCalled();

		target.dispatchEvent("ping", { value: 2 });
		expect(selfRemoving).toHaveBeenCalledTimes(1);
		expect(last).toHaveBeenCalledTimes(2);
		consoleError.mockRestore();
	});

	it("ignores a dispatch nobody listens for", () => {
		const target = new TypedEventTarget<TestEvents>();
		expect(() => target.dispatchEvent("ping", { value: 1 })).not.toThrow();
	});
});
