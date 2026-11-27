import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import RendererDecimalCurrency from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererDecimalCurrency";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
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

const renderParams = (editable: boolean): ModelRenderParams<number | null> => ({
	field: "price",
	value: 1234.5,
	initialValue: 1234.5,
	label: "Price",
	touched: false,
	dirty: false,
	autoFocus: false,
	visibility: {
		disabled: false,
		hidden: false,
		editable,
		readOnly: !editable,
		required: false,
		grid: false,
	},
	handleChange: vi.fn(),
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	setFieldTouched: vi.fn(),
	// a record without a currency yet
	values: { currency: "" },
});

describe("ModelDataTypeDecimalCurrencyRendererCC", () => {
	it.each([
		["the read-only view", false, "NumberFormatter"],
		["the edit view", true, "CurrencyInput"],
	])(
		"[ISSUE-3484-ITEM-12] %s shows the plain amount while the record has no currency, and disableErrorReporting turns its report off",
		(_where, editable, source) => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			configureErrorReporting({ report, shouldReport: () => true });
			const currency = (values: Record<string, unknown>) =>
				values.currency as string;
			const { container } = render(
				new RendererDecimalCurrency({
					currency,
					disableErrorReporting: true,
				}).render(renderParams(editable)),
			);
			const shown = () =>
				editable
					? container.querySelector("input")!.value
					: container.textContent;
			expect(shown()).toBe(editable ? "1,234.50" : "Price: 1,234.50");
			expect(report).not.toHaveBeenCalled();
			cleanup();
			render(
				new RendererDecimalCurrency({ currency }).render(
					renderParams(editable),
				),
			);
			expect(report).toHaveBeenCalledTimes(1);
			expect(report).toHaveBeenCalledWith(
				expect.objectContaining({ name: "RangeError" }),
				{ source, extra: { style: "currency", currency: "" } },
			);
		},
	);
});
