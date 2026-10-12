import { afterEach, describe, expect, it, type Mock, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import RendererStringNullable from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererStringNullable";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";

/**
 * The UIKit renderer for strings that can be unset: null shows as empty and
 * stays null until edited.
 */

afterEach(cleanup);

const theme = createTheme();

const renderParams = (
	value: string | null,
	handleChange: Mock<ModelRenderParams<string | null>["handleChange"]>,
	editable = true,
): ModelRenderParams<string | null> => ({
	field: "notes",
	value,
	initialValue: value,
	label: "Notes",
	touched: false,
	visibility: {
		disabled: false,
		hidden: false,
		editable,
		readOnly: !editable,
		required: false,
		grid: false,
	},
	handleChange,
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	setFieldTouched: vi.fn(),
	values: {},
});

describe("ModelDataTypeStringNullableRendererCC", () => {
	it("defaults to null and stringifies null as empty", () => {
		const renderer = new RendererStringNullable();

		expect(renderer.getDefaultValue()).toBeNull();
		expect(renderer.stringify(null)).toBe("");
		expect(renderer.stringify("text")).toBe("text");
	});

	it("shows null as an empty input and stores what is typed", () => {
		const renderer = new RendererStringNullable();
		const handleChange = vi.fn();
		render(
			<ThemeProvider theme={theme}>
				{renderer.render(renderParams(null, handleChange))}
			</ThemeProvider>,
		);

		const input = screen.getByRole<HTMLInputElement>("textbox");
		expect(input.value).toBe("");

		fireEvent.change(input, { target: { value: "new" } });
		expect(handleChange).toHaveBeenCalledWith("notes", "new");
	});

	it("shows only the label for null when read-only", () => {
		const renderer = new RendererStringNullable();
		const { container } = render(
			renderer.render(renderParams(null, vi.fn(), false)),
		);

		expect(container.textContent).toBe("Notes: ");
	});
});
