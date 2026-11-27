import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	expectTypeOf,
	it,
	vi,
} from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import {
	ModelDataTypeLocalizedStringRenderer,
	ModelDataTypeStringLocalizedSingleRenderer,
	ModelVisibilityGridView,
	ModelVisibilityView,
} from "../../src/backend-integration";
import type * as PackageRoot from "../../src";
import type {
	ModelDataTypeLocalizedStringRendererGetFallbackLabel,
	ModelDataTypeLocalizedStringRendererParams,
	ModelDataTypeLocalizedStringRendererParamsExtra,
} from "../../src/backend-integration/Model/Types/Renderers/RendererLocalizedString";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import type Visibility from "../../src/backend-integration/Model/Visibility";
import type { MultiLanguageInputSupportedLanguages } from "../../src/standalone/UIKit/InputControls/MultiLanguageInput";
import ccI18n from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";

/**
 * The localized string type (ModelDataTypeLocalizedStringRenderer): its text as
 * stringify returns it, and as a grid cell and a read-only form field show it.
 */

type LocalizedValue = Partial<
	Record<MultiLanguageInputSupportedLanguages, string>
>;

beforeAll(async () => {
	await waitForCcI18n();
});

beforeEach(async () => {
	await act(async () => {
		await ccI18n.changeLanguage("en");
	});
});

afterEach(async () => {
	cleanup();
	await ccI18n.changeLanguage("en");
});

const renderParams = (
	value: LocalizedValue,
	visibility: Visibility,
	values: Record<string, unknown> = {},
): ModelRenderParams<LocalizedValue> => ({
	field: "title",
	value,
	initialValue: value,
	label: "Title",
	touched: false,
	dirty: false,
	autoFocus: false,
	visibility,
	handleChange: vi.fn(),
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	setFieldTouched: vi.fn(),
	values,
});

describe("ModelDataTypeLocalizedStringRenderer: stringify", () => {
	it('[ISSUE-3486-ITEM-23] stringify of { de: "x" } with UI language en and no getFallbackLabel returns "x"', () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
		});
		expect(type.stringify({ de: "x" })).toBe("x");
	});

	it("[ISSUE-3486-ITEM-23] the UI language's text comes first, also after a language switch", async () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["de", "en"],
		});
		const value = { de: "Pumpe", en: "Pump" };
		expect(type.stringify(value)).toBe("Pump");
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		expect(type.stringify(value)).toBe("Pumpe");
	});

	it("[ISSUE-3486-ITEM-23] the fallback is the first enabled language with text, in the order of enabledLanguages", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "fr", "de"],
		});
		expect(type.stringify({ de: "Pumpe", fr: "Pompe" })).toBe("Pompe");
		expect(type.stringify({ de: "Pumpe", fr: "" })).toBe("Pumpe");
	});

	it("[ISSUE-3486-ITEM-23] the field's defaultLanguage is the first fallback, ahead of the first enabled language", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "fr", "de"],
			defaultLanguage: "de",
		});
		expect(type.stringify({ fr: "Pompe", de: "Pumpe" })).toBe("Pumpe");
		// without text of its own, the first enabled language with text
		expect(type.stringify({ fr: "Pompe", de: " " })).toBe("Pompe");
		// the UI language still comes first
		expect(type.stringify({ en: "Pump", de: "Pumpe" })).toBe("Pump");
	});

	it("[ISSUE-3486-ITEM-23] a defaultLanguage that is null or not enabled is ignored", () => {
		const notEnabled = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "fr"],
			defaultLanguage: "de",
		});
		expect(notEnabled.stringify({ fr: "Pompe", de: "Pumpe" })).toBe("Pompe");
		expect(notEnabled.stringify({ de: "Pumpe" })).toBe("");
		const unset = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "fr", "de"],
			defaultLanguage: null,
		});
		expect(unset.stringify({ fr: "Pompe", de: "Pumpe" })).toBe("Pompe");
	});

	it("[ISSUE-3486-ITEM-23] a language that is not enabled is no fallback", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
		});
		expect(type.stringify({ fr: "Pompe" })).toBe("");
	});

	it("[ISSUE-3486-ITEM-23] text of only whitespace counts as no text", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
		});
		expect(type.stringify({ en: "  ", de: "Pumpe" })).toBe("Pumpe");
		expect(type.stringify({ en: " ", de: "\n" })).toBe("");
	});

	it("[ISSUE-3486-ITEM-23] a value without text is an empty string", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
		});
		expect(type.stringify({})).toBe("");
		expect(type.stringify({ de: null } as unknown as LocalizedValue)).toBe("");
		expect(type.stringify(null as unknown as LocalizedValue)).toBe("");
	});

	it("[ISSUE-3486-ITEM-23] without enabled languages (single-language renderer) the fallback is the value's first language with text", () => {
		const type = new ModelDataTypeStringLocalizedSingleRenderer();
		expect(type.stringify({ fr: "", de: "Pumpe", nl: "Pomp" })).toBe("Pumpe");
		expect(type.stringify({ en: "Pump", de: "Pumpe" })).toBe("Pump");
	});
});

describe("ModelDataTypeLocalizedStringRenderer: grid and read-only view", () => {
	it("[ISSUE-3486-ITEM-23] a grid cell shows the fallback text, marked with its language", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
		});
		render(
			type.render(
				renderParams({ de: "Infusionspumpe" }, ModelVisibilityGridView),
			),
		);
		expect(screen.getByText("Infusionspumpe")).toHaveAttribute("lang", "de");
	});

	it("[ISSUE-3486-ITEM-23] a grid cell shows the defaultLanguage's text ahead of the first enabled language's, marked with its language", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "fr", "de"],
			defaultLanguage: "de",
		});
		const { container } = render(
			type.render(
				renderParams(
					{ fr: "Pompe à perfusion", de: "Infusionspumpe" },
					ModelVisibilityGridView,
				),
			),
		);
		expect(container).not.toHaveTextContent("Pompe à perfusion");
		expect(screen.getByText("Infusionspumpe")).toHaveAttribute("lang", "de");
	});

	it("[ISSUE-3486-ITEM-23] a read-only field shows its label and the fallback text", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
		});
		const { container } = render(
			type.render(renderParams({ de: "Infusionspumpe" }, ModelVisibilityView)),
		);
		expect(container).toHaveTextContent("Title: Infusionspumpe");
		expect(screen.getByText("Infusionspumpe")).toHaveAttribute("lang", "de");
	});

	it("[ISSUE-3486-ITEM-23] the UI language's text is not marked with another language", () => {
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
		});
		const { container } = render(
			type.render(
				renderParams(
					{ en: "Infusion pump", de: "Infusionspumpe" },
					ModelVisibilityGridView,
				),
			),
		);
		expect(container).toHaveTextContent("Infusion pump");
		expect(container.querySelector("[lang]")).toBeNull();
	});

	it("[ISSUE-3486-ITEM-23] getFallbackLabel comes before the fallback language; while it returns an empty string, the fallback language shows", () => {
		const getFallbackLabel = vi.fn(
			(_value: LocalizedValue, values: Record<string, unknown>) =>
				values.title_own as string,
		);
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
			getFallbackLabel,
			getFallbackLabelValues: ["title_own"],
		});
		const value = { de: "Infusionspumpe" };
		const { container, rerender } = render(
			type.render(
				renderParams(value, ModelVisibilityGridView, {
					title_own: "Pompe à perfusion",
				}),
			),
		);
		expect(container).toHaveTextContent("Pompe à perfusion");
		expect(container).not.toHaveTextContent("Infusionspumpe");
		expect(getFallbackLabel).toHaveBeenCalledWith(value, {
			title_own: "Pompe à perfusion",
		});

		rerender(
			type.render(
				renderParams(value, ModelVisibilityGridView, { title_own: "" }),
			),
		);
		expect(screen.getByText("Infusionspumpe")).toHaveAttribute("lang", "de");
	});

	it("[ISSUE-3486-ITEM-23] getFallbackLabel is not called while the UI language has text", () => {
		const getFallbackLabel = vi.fn(() => "fallback");
		const type = new ModelDataTypeLocalizedStringRenderer({
			enabledLanguages: ["en", "de"],
			getFallbackLabel,
		});
		const { container } = render(
			type.render(
				renderParams({ en: "Infusion pump" }, ModelVisibilityGridView),
			),
		);
		expect(container).toHaveTextContent("Infusion pump");
		expect(getFallbackLabel).not.toHaveBeenCalled();
	});
});

describe("ModelDataTypeLocalizedStringRenderer: exports", () => {
	it("[ISSUE-3486-ITEM-24] exports its params types and the getFallbackLabel type from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.ModelDataTypeLocalizedStringRendererParams>().toEqualTypeOf<ModelDataTypeLocalizedStringRendererParams>();
		expectTypeOf<PackageRoot.ModelDataTypeLocalizedStringRendererParamsExtra>().toEqualTypeOf<ModelDataTypeLocalizedStringRendererParamsExtra>();
		expectTypeOf<PackageRoot.ModelDataTypeLocalizedStringRendererGetFallbackLabel>().toEqualTypeOf<ModelDataTypeLocalizedStringRendererGetFallbackLabel>();
		// the params the package root names are the ones the renderer takes
		expectTypeOf<PackageRoot.ModelDataTypeLocalizedStringRendererParams>().toEqualTypeOf<
			ConstructorParameters<typeof ModelDataTypeLocalizedStringRenderer>[0]
		>();
	});
});
