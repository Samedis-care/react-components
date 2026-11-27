import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import RendererBooleanCheckboxMUI from "../../src/backend-integration/Model/Types/Renderers/Material-UI/RendererBooleanCheckbox";
import RendererBooleanSwitch from "../../src/backend-integration/Model/Types/Renderers/Material-UI/RendererBooleanSwitch";
import RendererBooleanCheckboxUIKit from "../../src/backend-integration/Model/Types/Renderers/UIKit/RendererBooleanCheckbox";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import type TypeBoolean from "../../src/backend-integration/Model/Types/TypeBoolean";
import ccI18n, { langs } from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";

/**
 * The boolean renderers (MUI checkbox, MUI switch, UIKit checkbox) on a field that isn't
 * editable: they show the value as text, Yes or No in the current language.
 */

beforeAll(async () => {
	await waitForCcI18n();
});

afterEach(async () => {
	cleanup();
	await ccI18n.changeLanguage("en");
});

const readOnlyParams = (
	value: boolean,
	grid = false,
): ModelRenderParams<boolean> => ({
	field: "active",
	value,
	initialValue: value,
	label: "Active",
	touched: false,
	dirty: false,
	autoFocus: false,
	visibility: {
		disabled: false,
		hidden: false,
		editable: false,
		readOnly: true,
		required: false,
		grid,
	},
	handleChange: vi.fn(),
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	setFieldTouched: vi.fn(),
	values: {},
});

const renderers: [string, TypeBoolean][] = [
	["MUI checkbox", new RendererBooleanCheckboxMUI()],
	["MUI switch", new RendererBooleanSwitch()],
	["UIKit checkbox", new RendererBooleanCheckboxUIKit()],
];

describe("boolean renderers, not editable", () => {
	it.each(renderers)(
		"[ISSUE-3506-ITEM-23] %s: reads Oui and Non in French",
		async (_name, renderer) => {
			await act(async () => {
				await ccI18n.changeLanguage("fr");
			});
			const { container, rerender } = render(
				renderer.render(readOnlyParams(true)),
			);
			expect(container).toHaveTextContent(/^Active: Oui$/);
			rerender(renderer.render(readOnlyParams(false)));
			expect(container).toHaveTextContent(/^Active: Non$/);
		},
	);

	it("[ISSUE-3506-ITEM-23] in every locale, a data grid cell reads the same Yes and No as the boolean's text form", async () => {
		const renderer = new RendererBooleanCheckboxMUI();
		const mismatches: string[] = [];
		for (const lang of langs) {
			await act(async () => {
				await ccI18n.changeLanguage(lang);
			});
			for (const value of [true, false]) {
				const { container, unmount } = render(
					renderer.render(readOnlyParams(value, true)),
				);
				const shown = container.textContent;
				const text = renderer.stringify(value);
				if (shown !== text) mismatches.push(`${lang}: ${shown} ≠ ${text}`);
				unmount();
			}
		}
		expect(mismatches).toEqual([]);
	});
});
