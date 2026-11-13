import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { act, render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { BackActionButton } from "../../../src/backend-components/Form/DefaultFormPageButtons";
import FlowEngineBackButton from "../../../src/backend-components/Form/FlowEngine/FlowEngineBackButton";
import {
	PageProps,
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { ModelUnknown } from "../../../src/backend-integration";
import ccI18n from "../../../src/i18n";
import {
	loaded,
	makeModel,
	mountForm,
	recordData,
	setupFormTests,
	Sink,
	TestFormProps,
} from "./formFixture";

setupFormTests();

const theme = createTheme();
const wrap = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

afterEach(() => {
	cleanup();
});

/**
 * Collects values of a given CSS property (or custom property) from all rules
 * whose selector actually matches the element.
 * MUI v7 injects colors via CSS custom properties such as --variant-containedBg,
 * so those must be queried in addition to standard properties.
 */
function getAppliedCssValues(el: HTMLElement, property: string): string[] {
	const styleTexts = Array.from(document.querySelectorAll("style"))
		.map((s) => s.textContent ?? "")
		.join("\n");

	const values: string[] = [];
	const escapedProp = property.replace(/-/g, "\\-");
	const rulePattern = new RegExp(
		`([^{}]+)\\{[^}]*${escapedProp}\\s*:\\s*([^;})]+)`,
		"g",
	);
	let match;
	while ((match = rulePattern.exec(styleTexts)) !== null) {
		const selector = match[1].trim();
		const value = match[2].trim().toLowerCase();
		try {
			if (el.matches(selector)) values.push(value);
		} catch {
			// skip selectors JSDOM cannot parse (e.g. inside @media)
		}
	}
	return values;
}

// MUI's grey for a contained button without a palette color, in the light palette
const GREY_BG = theme.palette.grey[300].toLowerCase();

describe("BackActionButton / FlowEngineBackButton color prop", () => {
	it("uses grey background by default when no color prop is given", () => {
		wrap(<BackActionButton>Back</BackActionButton>);
		const button = screen.getByRole("button");
		const bgs = getAppliedCssValues(button, "background-color");
		expect(bgs.some((c) => c === GREY_BG)).toBe(true);
	});

	it("applies error palette colors when color=error is provided", () => {
		wrap(<BackActionButton color="error">Back</BackActionButton>);
		const button = screen.getByRole("button");

		// MUI v7 sets palette colors via CSS custom properties on the element's class
		const containedBgs = getAppliedCssValues(button, "--variant-containedBg");
		const containedColors = getAppliedCssValues(
			button,
			"--variant-containedColor",
		);

		// grey override must be absent
		expect(
			getAppliedCssValues(button, "background-color").some(
				(c) => c === GREY_BG,
			),
		).toBe(false);
		// theme error colors must be present
		expect(
			containedBgs.some((c) => c === theme.palette.error.main.toLowerCase()),
		).toBe(true);
		expect(
			containedColors.some(
				(c) => c === theme.palette.error.contrastText.toLowerCase(),
			),
		).toBe(true);
	});
});

/**
 * Mounts a Form (record "1") whose page renders the given content, with the customProps
 * (goBack, hasCustomSubmitHandler) a CRUD gives its form
 */
const mountWith = (
	customProps: Record<string, unknown>,
	content: () => React.ReactNode,
	connector = new MockConnector(recordData()),
) => {
	const sink: Sink = {};
	const Page = (props: PageProps<ModelUnknown, unknown>) => {
		sink.ctx = useFormContext<ModelUnknown>();
		void props;
		return <>{content()}</>;
	};
	const result = mountForm(
		makeModel({}, connector),
		Page as never,
		{
			customProps,
		} as TestFormProps,
	);
	return { ...result, sink };
};

describe("[ISSUE-3504-ITEM-10] FlowEngineBackButton's label", () => {
	afterEach(async () => {
		await ccI18n.changeLanguage("en");
	});

	it("[ISSUE-3504-ITEM-10] is Cancel by default, as the button leaves the whole flow", async () => {
		const { sink } = mountWith(
			{ goBack: vi.fn(), hasCustomSubmitHandler: false },
			() => <FlowEngineBackButton />,
		);
		await loaded(sink);
		expect(screen.getByRole("button")).toHaveAccessibleName("Cancel");
	});

	it("[ISSUE-3504-ITEM-10] the default follows the language (common.buttons.cancel)", async () => {
		const { sink } = mountWith(
			{ goBack: vi.fn(), hasCustomSubmitHandler: false },
			() => <FlowEngineBackButton />,
		);
		await loaded(sink);
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		expect(screen.getByRole("button")).toHaveAccessibleName("Abbrechen");
	});

	it("[ISSUE-3504-ITEM-10] children replace the default", async () => {
		const { sink } = mountWith(
			{ goBack: vi.fn(), hasCustomSubmitHandler: false },
			() => <FlowEngineBackButton>{"Back to the list"}</FlowEngineBackButton>,
		);
		await loaded(sink);
		expect(screen.getByRole("button")).toHaveAccessibleName("Back to the list");
	});
});
