import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import RendererDateCC from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererDate";
import RendererDateNullableCC from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererDateNullable";
import RendererDateTimeCC from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererDateTime";
import RendererDateTimeNullableCC from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererDateTimeNullable";
import RendererDateMUI from "../../src/backend-integration/Model/Types/Renderers/Material-UI/RendererDate";
import RendererDateNullableMUI from "../../src/backend-integration/Model/Types/Renderers/Material-UI/RendererDateNullable";

/**
 * The model's date and date-time renderers show the field's error or warning
 * message below the field. It has to be the field's description, so a screen
 * reader reads it when the user reaches the field.
 */

afterEach(cleanup);

const theme = createTheme();
const DAY = new Date("2026-08-13T12:00:00.000Z");

/** What the tests need of a renderer (its params type differs: Date or Date | null) */
interface DateRenderer {
	render(params: never): React.ReactElement;
}

const RENDERERS: [string, () => DateRenderer][] = [
	["UIKit RendererDate", () => new RendererDateCC()],
	["UIKit RendererDateNullable", () => new RendererDateNullableCC()],
	["UIKit RendererDateTime", () => new RendererDateTimeCC()],
	["UIKit RendererDateTimeNullable", () => new RendererDateTimeNullableCC()],
	["Material-UI RendererDate", () => new RendererDateMUI()],
	["Material-UI RendererDateNullable", () => new RendererDateNullableMUI()],
];

/** An editable field with the given messages, as FormField renders it */
const mount = (
	renderer: DateRenderer,
	errorMsg: string | null,
	warningMsg: string | null,
) => {
	const params: ModelRenderParams<Date> = {
		field: "due_at",
		value: DAY,
		initialValue: DAY,
		label: "Due",
		touched: true,
		dirty: false,
		autoFocus: false,
		visibility: {
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: false,
			required: false,
			grid: false,
		},
		handleChange: vi.fn(),
		handleBlur: vi.fn(),
		setFieldTouched: vi.fn(),
		errorMsg,
		warningMsg,
		setError: vi.fn(),
		setFieldValue: vi.fn(),
		values: {},
	};
	return render(
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				{renderer.render(params as never)}
			</LocalizationProvider>
		</ThemeProvider>,
	);
};

const group = () => screen.getByRole("group", { name: "Due" });

describe("date renderers' message", () => {
	it.each(RENDERERS)(
		"[ISSUE-3485-ITEM-13] %s makes its error message the field's description",
		(_name, create) => {
			mount(create(), "Date is required", null);
			expect(group()).toHaveAccessibleDescription("Date is required");
			expect(group()).toHaveAttribute("aria-invalid", "true");
			expect(screen.getAllByText("Date is required")).toHaveLength(1);
		},
	);

	it.each(RENDERERS)(
		"[ISSUE-3485-ITEM-13] %s makes its warning the field's description, without marking it invalid",
		(_name, create) => {
			mount(create(), null, "Is that a holiday?");
			expect(group()).toHaveAccessibleDescription("Is that a holiday?");
			expect(group()).toHaveAttribute("aria-invalid", "false");
			expect(screen.getAllByText("Is that a holiday?")).toHaveLength(1);
		},
	);

	it.each(RENDERERS)(
		"[ISSUE-3485-ITEM-13] %s shows the error, not the warning, when it has both",
		(_name, create) => {
			mount(create(), "Date is required", "Is that a holiday?");
			expect(group()).toHaveAccessibleDescription("Date is required");
			expect(screen.queryByText("Is that a holiday?")).toBeNull();
		},
	);

	it.each(RENDERERS)(
		"[ISSUE-3485-ITEM-13] %s has no description without a message",
		(_name, create) => {
			mount(create(), null, null);
			expect(group()).not.toHaveAttribute("aria-describedby");
		},
	);
});
