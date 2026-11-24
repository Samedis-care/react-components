import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import NumberFormatter from "../../src/standalone/UIKit/NumberFormatter";

// The default error reporter sends to the optional @sentry/react import;
// mocking it makes those reports observable
const { captureException } = vi.hoisted(() => ({ captureException: vi.fn() }));
vi.mock("@sentry/react", () => ({ captureException }));

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	captureException.mockClear();
});

describe("NumberFormatter error reporting", () => {
	it("[ISSUE-3482-ITEM-26] reports a malformed currency to Sentry without any configuration, and nothing with disableErrorReporting", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		render(
			<>
				<NumberFormatter
					value={1}
					options={{ style: "currency", currency: "EUROS" }}
					disableErrorReporting
				/>
				<NumberFormatter
					value={1}
					options={{ style: "currency", currency: "EURO" }}
				/>
			</>,
		);
		// the first one would have been sent first, through the same import
		await vi.waitFor(() => expect(captureException).toHaveBeenCalled());
		expect(captureException).toHaveBeenCalledTimes(1);
		expect(captureException).toHaveBeenCalledWith(
			expect.objectContaining({ name: "RangeError" }),
			{
				extra: {
					ccSource: "NumberFormatter",
					style: "currency",
					currency: "EURO",
				},
			},
		);
	});
});
