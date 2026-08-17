import { afterEach, describe, expect, it, type Mock, vi } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import RendererDate from "../../src/backend-integration/Model/Types/Renderers/Material-UI/RendererDate";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import { normalizeDate } from "../../src/utils/dateOnlyUtils";

/**
 * `RendererDate` backs a non-nullable date field, but the field it renders can
 * still be emptied — by the clear button, or by deleting a single section. That
 * used to `throw` inside a React event handler.
 */

afterEach(cleanup);

const theme = createTheme();

interface Handlers {
	handleChange: Mock<ModelRenderParams<Date>["handleChange"]>;
	setFieldTouched: Mock<ModelRenderParams<Date>["setFieldTouched"]>;
}

const renderParams = (
	value: Date,
	handlers: Handlers,
): ModelRenderParams<Date> => ({
	field: "birthday",
	value,
	initialValue: value,
	label: "Birthday",
	touched: false,
	visibility: {
		disabled: false,
		hidden: false,
		editable: true,
		readOnly: false,
		required: true,
		grid: false,
	},
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	values: {},
	...handlers,
});

/** Renders the editable field and hands back the picker's `onChange` */
const renderEditable = (value: Date, handlers: Handlers) => {
	const renderer = new RendererDate();
	const element = renderer.render(renderParams(value, handlers));
	render(
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				{element}
			</LocalizationProvider>
		</ThemeProvider>,
	);
	return renderer;
};

/**
 * Calls the picker's `onChange` the way the field does. Reaching into the
 * element tree keeps this independent of how the value gets emptied in the DOM,
 * which is the picker's business, not the renderer's.
 */
const emitChange = (renderer: RendererDate, value: Date, date: unknown) => {
	const handlers: Handlers = {
		handleChange: vi.fn(),
		setFieldTouched: vi.fn(),
	};
	const element = renderer.render(
		renderParams(value, handlers),
	) as React.ReactElement<{ children: React.ReactElement[] }>;
	const picker = element.props.children[0] as React.ReactElement<{
		onChange: (date: unknown) => void;
	}>;
	picker.props.onChange(date);
	return handlers;
};

describe("RendererDate", () => {
	const stored = normalizeDate(new Date(2026, 7, 12));

	it("reports a validation error instead of throwing when emptied", () => {
		const renderer = renderEditable(stored, {
			handleChange: vi.fn(),
			setFieldTouched: vi.fn(),
		});

		const handlers = emitChange(renderer, stored, null);

		expect(renderer.validate()).toBe("Please enter a valid date");
		// the model value is left alone — there is no null to store
		expect(handlers.handleChange).not.toHaveBeenCalled();
		// and the field is marked touched so the form revalidates
		expect(handlers.setFieldTouched).toHaveBeenCalledWith(
			"birthday",
			false,
			true,
		);
	});

	it("clears the error again once a date is entered", async () => {
		const moment = (await import("moment")).default;
		const renderer = renderEditable(stored, {
			handleChange: vi.fn(),
			setFieldTouched: vi.fn(),
		});

		emitChange(renderer, stored, null);
		expect(renderer.validate()).toBe("Please enter a valid date");

		const handlers = emitChange(renderer, stored, moment("2030-01-15"));

		expect(renderer.validate()).toBeNull();
		expect(handlers.handleChange).toHaveBeenCalledTimes(1);
		const emitted = handlers.handleChange.mock.calls[0][1];
		expect(emitted.toISOString()).toBe("2030-01-15T12:00:00.000Z");
	});
});
