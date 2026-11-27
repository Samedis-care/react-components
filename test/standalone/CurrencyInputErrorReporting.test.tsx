import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import CurrencyInput from "../../src/standalone/UIKit/InputControls/CurrencyInput";
import {
	configureErrorReporting,
	getErrorReportingConfig,
} from "../../src/framework/ErrorReporting";

const before = { ...getErrorReportingConfig() };
const report = vi.fn();

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	report.mockClear();
	configureErrorReporting(before);
});

const noop = () => {};

/** the console.error calls of CurrencyInput itself, not React's */
const logged = (calls: unknown[][]) =>
	calls.filter(
		([message]) =>
			typeof message === "string" &&
			message.startsWith("[Components-Care] [CurrencyInput]"),
	);

describe("CurrencyInput error reporting", () => {
	it("[ISSUE-3484-ITEM-12] reports a missing or malformed currency once while it shows an amount, not on every render", () => {
		const error = vi.spyOn(console, "error").mockImplementation(noop);
		configureErrorReporting({ report, shouldReport: () => true });
		const ui = (value: number | null, currency: string) => (
			<React.StrictMode>
				<CurrencyInput
					label="Amount"
					currency={currency}
					value={value}
					onChange={noop}
				/>
			</React.StrictMode>
		);
		const { rerender } = render(ui(null, ""));
		// an empty field shows no amount without its currency
		expect(report).not.toHaveBeenCalled();
		rerender(ui(1, ""));
		expect(report).toHaveBeenCalledTimes(1);
		expect(report).toHaveBeenLastCalledWith(
			expect.objectContaining({ name: "RangeError" }),
			{ source: "CurrencyInput", extra: { style: "currency", currency: "" } },
		);
		rerender(ui(2, ""));
		rerender(ui(2, "EUR"));
		expect(report).toHaveBeenCalledTimes(1);
		rerender(ui(2, "EURO"));
		rerender(ui(3, "EURO"));
		expect(report).toHaveBeenCalledTimes(2);
		expect(report).toHaveBeenLastCalledWith(
			expect.objectContaining({ name: "RangeError" }),
			{
				source: "CurrencyInput",
				extra: { style: "currency", currency: "EURO" },
			},
		);
		expect(logged(error.mock.calls)).toHaveLength(2);
		expect(logged(error.mock.calls)[1][1]).toBe(report.mock.calls[1][0]);
	});

	it("[ISSUE-3484-ITEM-12] reports nothing with disableErrorReporting, until it is turned off", () => {
		const error = vi.spyOn(console, "error").mockImplementation(noop);
		configureErrorReporting({ report, shouldReport: () => true });
		const ui = (disableErrorReporting: boolean) => (
			<CurrencyInput
				label="Amount"
				currency="EURO"
				value={1}
				onChange={noop}
				disableErrorReporting={disableErrorReporting}
			/>
		);
		const { rerender } = render(ui(true));
		expect(report).not.toHaveBeenCalled();
		expect(error).not.toHaveBeenCalled();
		rerender(ui(false));
		expect(report).toHaveBeenCalledTimes(1);
		expect(logged(error.mock.calls)).toHaveLength(1);
	});
});
