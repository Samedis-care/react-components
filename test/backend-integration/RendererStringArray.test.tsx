import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React, { useCallback, useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import RendererStringArray, {
	ModelDataTypeStringArrayRendererCCParams,
} from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererStringArray";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import ccI18n from "../../src/i18n";

/**
 * The UIKit string list renderer (ModelDataTypeStringArrayRendererCC): one text field per
 * entry plus an empty one at the end for a new entry, inside a group box named by the
 * field's label.
 */

beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
});

afterEach(async () => {
	cleanup();
	await ccI18n.changeLanguage("en");
});

const renderParams = (
	value: string[],
	handleChange: ModelRenderParams<string[]>["handleChange"],
): ModelRenderParams<string[]> => ({
	field: "tags",
	value,
	initialValue: value,
	label: "Tags",
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
	handleChange,
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	setFieldTouched: vi.fn(),
	values: {},
});

/**
 * The renderer with its value in state, as a form would hold it
 */
const StringList = (props: {
	initial: string[];
	options?: ModelDataTypeStringArrayRendererCCParams;
}) => {
	const [renderer] = useState(() => new RendererStringArray(props.options));
	const [value, setValue] = useState(props.initial);
	const handleChange = useCallback(
		(_field: string, next: string[]) => setValue(next),
		[],
	);
	return renderer.render(renderParams(value, handleChange));
};

/**
 * Expects the list's inputs, in document order, to have these accessible names
 */
const expectNames = (expected: string[]) => {
	const inputs = screen.getAllByRole("textbox");
	expect(inputs).toHaveLength(expected.length);
	inputs.forEach((input, idx) =>
		expect(input).toHaveAccessibleName(expected[idx]),
	);
};

describe("ModelDataTypeStringArrayRendererCC", () => {
	it("[ISSUE-3501-ITEM-43] each entry is named by the field's label and its position, the empty one at the end as the new entry", () => {
		render(<StringList initial={["a", "b"]} />);
		expect(screen.getByRole("textbox", { name: "Tags 1" })).toHaveValue("a");
		expect(screen.getByRole("textbox", { name: "Tags 2" })).toHaveValue("b");
		expect(
			screen.getByRole("textbox", { name: "Tags: new entry" }),
		).toHaveValue("");
		expectNames(["Tags 1", "Tags 2", "Tags: new entry"]);
	});

	it("[ISSUE-3501-ITEM-43] an empty list has only the new entry", () => {
		render(<StringList initial={[]} />);
		expectNames(["Tags: new entry"]);
	});

	it("[ISSUE-3501-ITEM-43] typing into the new entry makes it the next numbered entry, and a new empty one follows", () => {
		render(<StringList initial={["a"]} />);
		fireEvent.change(screen.getByRole("textbox", { name: "Tags: new entry" }), {
			target: { value: "b" },
		});
		expect(screen.getByRole("textbox", { name: "Tags 2" })).toHaveValue("b");
		expectNames(["Tags 1", "Tags 2", "Tags: new entry"]);
	});

	it("[ISSUE-3501-ITEM-43] the names follow the language", async () => {
		render(<StringList initial={["a"]} />);
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		expectNames(["Tags 1", "Tags: neuer Eintrag"]);
	});

	it("[ISSUE-3501-ITEM-43] the names are added to the input attributes of the renderer's options", () => {
		render(
			<StringList
				initial={["a"]}
				options={{ slotProps: { htmlInput: { maxLength: 5 } } }}
			/>,
		);
		const first = screen.getByRole("textbox", { name: "Tags 1" });
		expect(first).toHaveAttribute("maxlength", "5");
		expect(
			screen.getByRole("textbox", { name: "Tags: new entry" }),
		).toHaveAttribute("maxlength", "5");
	});
});
