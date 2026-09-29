import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	MockInstance,
	vi,
} from "vitest";
import { renderHook } from "@testing-library/react";
import useObjectUrl from "../../src/utils/useObjectUrl";

let nextUrl = 0;
let createObjectURL: MockInstance<typeof URL.createObjectURL>;
let revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;

beforeEach(() => {
	nextUrl = 0;
	createObjectURL = vi
		.spyOn(URL, "createObjectURL")
		.mockImplementation(() => `blob:url-${nextUrl++}`);
	revokeObjectURL = vi
		.spyOn(URL, "revokeObjectURL")
		.mockImplementation(() => undefined);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("useObjectUrl", () => {
	it("passes a URL on as it is", () => {
		const { result } = renderHook(() => useObjectUrl("https://x/y.png"));
		expect(result.current).toBe("https://x/y.png");
		expect(createObjectURL).not.toHaveBeenCalled();
	});

	it("gives no URL for no value", () => {
		expect(renderHook(() => useObjectUrl("")).result.current).toBeUndefined();
		expect(
			renderHook(() => useObjectUrl(undefined)).result.current,
		).toBeUndefined();
	});

	it("shows a Blob through an object URL, revoked when the value changes and on unmount", () => {
		const first = new Blob(["a"]);
		const second = new Blob(["b"]);
		const { result, rerender, unmount } = renderHook(
			({ value }: { value: Blob | string }) => useObjectUrl(value),
			{ initialProps: { value: first as Blob | string } },
		);
		expect(result.current).toBe("blob:url-0");
		expect(createObjectURL).toHaveBeenCalledWith(first);

		rerender({ value: second });
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:url-0");
		expect(result.current).toBe("blob:url-1");

		rerender({ value: "https://x/y.png" });
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:url-1");
		expect(result.current).toBe("https://x/y.png");

		rerender({ value: first });
		unmount();
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:url-2");
	});
});
