import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import RendererEnumSimpleSelect from "../../src/backend-integration/Model/Types/Renderers/Material-UI/RendererEnumSimpleSelect";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";

/**
 * The MUI enum select renderer (ModelDataTypeEnumSelectRendererMUI) rendered on its own,
 * the way a data grid cell or the import preview renders it: without a form, so without
 * the field id that FormField hands to renderers.
 */

afterEach(cleanup);

const renderParams = (
	extra: Partial<ModelRenderParams<string>> = {},
): ModelRenderParams<string> => ({
	field: "priority",
	value: "low",
	initialValue: "low",
	label: "Priority",
	touched: false,
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
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	setFieldTouched: vi.fn(),
	values: {},
	...extra,
});

const renderer = new RendererEnumSimpleSelect<string>(
	[
		{ value: "low", getLabel: () => "Low" },
		{ value: "high", getLabel: () => "High" },
	],
	"low",
);

describe("ModelDataTypeEnumSelectRendererMUI", () => {
	it.each([
		["with a field id", { id: "priority-field" }],
		["without a field id", {}],
		[
			"in an editable data grid cell",
			{ visibility: { ...renderParams().visibility, grid: true } },
		],
	] as const)(
		"[ISSUE-3501-ITEM-42] %s, the combobox and its list of options are named by the label",
		async (_, extra) => {
			render(renderer.render(renderParams(extra)));
			const combobox = screen.getByRole("combobox", { name: "Priority" });
			fireEvent.mouseDown(combobox);
			expect(
				await screen.findByRole("listbox", { name: "Priority" }),
			).toBeInTheDocument();
		},
	);

	it("[ISSUE-3506-ITEM-9] in an editable data grid cell, gridCellLabel names the combobox and its options", async () => {
		render(
			renderer.render(
				renderParams({
					visibility: { ...renderParams().visibility, grid: true },
					gridCellLabel: "Priority, Alice",
				}),
			),
		);
		const combobox = screen.getByRole("combobox", { name: "Priority, Alice" });
		fireEvent.mouseDown(combobox);
		expect(
			await screen.findByRole("listbox", { name: "Priority, Alice" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3501-ITEM-44] two editable data grid cells of the field share no id", () => {
		const cell = (row: string) =>
			renderer.render(
				renderParams({
					visibility: { ...renderParams().visibility, grid: true },
					gridCellLabel: `Priority, ${row}`,
				}),
			);
		const { container } = render(
			<>
				{cell("Alice")}
				{cell("Bob")}
			</>,
		);
		expect(screen.getAllByRole("combobox")).toHaveLength(2);
		const ids = Array.from(
			container.querySelectorAll("[id]"),
			(element) => element.id,
		);
		expect(ids).toEqual([...new Set(ids)]);
	});

	it("[ISSUE-3501-ITEM-44] with a field id, the combobox has that id and the select the field's name", () => {
		const { container } = render(
			renderer.render(renderParams({ id: "priority-field" })),
		);
		expect(screen.getByRole("combobox")).toHaveAttribute(
			"id",
			"priority-field",
		);
		expect(container.querySelector('input[name="priority"]')).toHaveValue(
			"low",
		);
	});
});
