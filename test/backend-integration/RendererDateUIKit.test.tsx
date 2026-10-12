import { afterEach, describe, expect, it, type Mock, vi } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import RendererDate from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererDate";
import RendererDateTime from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererDateTime";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import { normalizeDate } from "../../src/utils/dateOnlyUtils";

/**
 * The UIKit renderers for non-nullable dates: their input can still be
 * emptied, which has to surface as a validation error, not as a null value.
 */

afterEach(cleanup);

const theme = createTheme();

interface Handlers {
	handleChange: Mock<ModelRenderParams<Date>["handleChange"]>;
	setFieldTouched: Mock<ModelRenderParams<Date>["setFieldTouched"]>;
}

const handlers = (): Handlers => ({
	handleChange: vi.fn(),
	setFieldTouched: vi.fn(),
});

const renderParams = (
	value: Date,
	h: Handlers,
	editable = true,
): ModelRenderParams<Date> => ({
	field: "due_at",
	value,
	initialValue: value,
	label: "Due",
	touched: false,
	visibility: {
		disabled: false,
		hidden: false,
		editable,
		readOnly: !editable,
		required: true,
		grid: false,
	},
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	values: {},
	...h,
});

type Renderer = RendererDate | RendererDateTime;

const mount = (renderer: Renderer, value: Date) =>
	render(
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				{renderer.render(renderParams(value, handlers()))}
			</LocalizationProvider>
		</ThemeProvider>,
	);

/** Calls the input's `onChange` the way the field does */
const emitChange = (renderer: Renderer, value: Date, date: unknown) => {
	const h = handlers();
	const element = renderer.render(
		renderParams(value, h),
	) as React.ReactElement<{
		children: React.ReactElement[];
	}>;
	const input = element.props.children[0] as React.ReactElement<{
		onChange: (date: unknown) => void;
	}>;
	input.props.onChange(date);
	return h;
};

describe("ModelDataTypeDateRendererCC", () => {
	const stored = normalizeDate(new Date(2026, 7, 12));

	it("reports a validation error instead of storing null when emptied", () => {
		const renderer = new RendererDate();
		mount(renderer, stored);

		const h = emitChange(renderer, stored, null);

		expect(renderer.validate()).toBe("Please enter a valid date");
		expect(h.handleChange).not.toHaveBeenCalled();
		expect(h.setFieldTouched).toHaveBeenCalledWith("due_at", false, true);
	});

	it("stores an entered date and clears the error", () => {
		const renderer = new RendererDate();
		emitChange(renderer, stored, null);

		const entered = normalizeDate(new Date(2030, 0, 15));
		const h = emitChange(renderer, stored, entered);

		expect(renderer.validate()).toBeNull();
		expect(h.handleChange).toHaveBeenCalledWith("due_at", entered);
	});

	it("shows the date when read-only", () => {
		const renderer = new RendererDate();
		const { container } = render(
			renderer.render(renderParams(stored, handlers(), false)),
		);
		expect(container.textContent).toContain("Due: ");
		expect(container.textContent).not.toContain("not set");
	});
});

describe("ModelDataTypeDateTimeRendererCC", () => {
	const stored = new Date("2026-08-12T09:30:00.000Z");

	it("reports a validation error instead of storing null when emptied", () => {
		const renderer = new RendererDateTime();
		mount(renderer, stored);

		const h = emitChange(renderer, stored, null);

		expect(renderer.validate()).toBe("Please enter a valid date");
		expect(h.handleChange).not.toHaveBeenCalled();
		expect(h.setFieldTouched).toHaveBeenCalledWith("due_at", false, true);
	});

	it("stores an entered date and time and clears the error", () => {
		const renderer = new RendererDateTime();
		emitChange(renderer, stored, null);

		const h = emitChange(renderer, stored, moment("2030-01-15T10:45:00Z"));

		expect(renderer.validate()).toBeNull();
		expect(h.handleChange).toHaveBeenCalledTimes(1);
		expect(h.handleChange.mock.calls[0][1].toISOString()).toBe(
			"2030-01-15T10:45:00.000Z",
		);
	});
});
