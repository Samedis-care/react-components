import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import {
	Checkbox,
	createTheme,
	FormControlLabel,
	Theme,
	ThemeProvider,
} from "@mui/material";
import ccI18n from "../../src/i18n";
import TextFieldWithHelp from "../../src/standalone/UIKit/TextFieldWithHelp";
import SingleSelect from "../../src/standalone/Selector/SingleSelect";
import { selectorLocalLoadHandler } from "../../src/standalone/Selector/BaseSelector";
import {
	FormControlCC,
	FormHelperTextCC,
	FormLabelCC,
	labelWithDirtyMarker,
	labelWithDirtyText,
	TextFieldCC,
} from "../../src/standalone/UIKit/MuiFieldState";

/**
 * What the field states of withMuiFieldState expose to assistive technology. The dirty
 * marker is a dot after the label; the label also says it in words, so that the field's
 * name tells a screen reader user the field is modified.
 */

const theme = createTheme();
const Wrap = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider theme={theme}>{children}</ThemeProvider>
);
const wrap = (ui: React.ReactNode, withTheme: Theme = theme) =>
	render(<ThemeProvider theme={withTheme}>{ui}</ThemeProvider>);

afterEach(async () => {
	cleanup();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

describe("dirty state in the field's name", () => {
	it.each(["standard", "filled", "outlined"] as const)(
		"[ISSUE-3474-ITEM-26] names a modified %s text field after its label and the state, and drops the state once it is no longer modified",
		(variant) => {
			const field = (dirty: boolean) => (
				<Wrap>
					<TextFieldCC
						label="Serial"
						variant={variant}
						value="x"
						dirty={dirty}
						required
					/>
				</Wrap>
			);
			const { rerender } = render(field(true));
			// the required asterisk stays hidden, and the outlined border's copy of the
			// label does not repeat it
			expect(screen.getByRole("textbox")).toHaveAccessibleName(
				"Serial (modified)",
			);
			rerender(field(false));
			expect(screen.getByRole("textbox")).toHaveAccessibleName("Serial");
		},
	);

	it("[ISSUE-3474-ITEM-26] leaves a field without a label as it is", () => {
		const { container } = render(
			<Wrap>
				<TextFieldCC
					value="x"
					dirty
					slotProps={{ htmlInput: { "aria-label": "Serial" } }}
				/>
			</Wrap>,
		);
		expect(screen.getByRole("textbox")).toHaveAccessibleName("Serial");
		// no label of the text's own, which would carry the dot too
		expect(container.querySelector("label")).toBeNull();
	});

	it("[ISSUE-3474-ITEM-26] says it in the user's language", async () => {
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		render(
			<Wrap>
				<TextFieldCC label="Seriennummer" value="x" dirty />
			</Wrap>,
		);
		expect(screen.getByRole("textbox")).toHaveAccessibleName(
			"Seriennummer (geändert)",
		);
	});

	it("[ISSUE-3474-ITEM-26] leaves the state out of the name where the theme hides the text", () => {
		const hidden = createTheme({
			components: {
				CcDirtyMarker: { styleOverrides: { text: { display: "none" } } },
			},
		});
		render(
			<ThemeProvider theme={hidden}>
				<TextFieldCC label="Serial" value="x" dirty />
			</ThemeProvider>,
		);
		expect(screen.getByRole("textbox")).toHaveAccessibleName("Serial");
	});

	it("[ISSUE-3474-ITEM-26] marks a label component through its children", () => {
		render(
			<Wrap>
				<FormLabelCC id="serial-label" dirty>
					Serial
				</FormLabelCC>
				<input aria-labelledby="serial-label" />
			</Wrap>,
		);
		expect(screen.getByRole("textbox")).toHaveAccessibleName(
			"Serial (modified)",
		);
	});

	it("[ISSUE-3474-ITEM-26] labelWithDirtyMarker says what its dot means, and hides the dot", () => {
		const { container } = render(
			<Wrap>
				<label htmlFor="files">{labelWithDirtyMarker("Files", true)}</label>
				<input id="files" />
			</Wrap>,
		);
		expect(screen.getByRole("textbox")).toHaveAccessibleName(
			"Files (modified)",
		);
		const label = container.querySelector("label")!;
		// the dot, then the text
		expect(label.children).toHaveLength(2);
		expect(label.children[0]).toHaveAttribute("aria-hidden", "true");
		expect(label.children[1]).not.toHaveAttribute("aria-hidden");
	});

	it.each([
		["labelWithDirtyMarker", labelWithDirtyMarker],
		["labelWithDirtyText", labelWithDirtyText],
	] as const)(
		"[ISSUE-3474-ITEM-26] %s leaves the label of an unmodified field as it is",
		(_name, mark) => {
			expect(mark("Files", false)).toBe("Files");
			expect(mark("Files", undefined)).toBe("Files");
		},
	);
});

describe("withMuiFieldState", () => {
	it("[ISSUE-3483-ITEM-11] passes the classes prop on to the wrapped control", async () => {
		wrap(
			<>
				<TextFieldCC label="T" classes={{ root: "x-tf-root" }} />
				<FormControlCC classes={{ root: "x-fc-root" }}>
					<FormLabelCC required classes={{ asterisk: "x-asterisk" }}>
						L
					</FormLabelCC>
					<FormHelperTextCC classes={{ root: "x-ht-root" }}>h</FormHelperTextCC>
				</FormControlCC>
				<TextFieldWithHelp label="W" classes={{ root: "x-tfwh-root" }} />
			</>,
		);
		await screen.findByRole("textbox", { name: "W" });
		const found = [
			"x-tf-root",
			"x-fc-root",
			"x-asterisk",
			"x-ht-root",
			"x-tfwh-root",
		].filter((name) => document.getElementsByClassName(name).length === 1);
		expect(found).toEqual([
			"x-tf-root",
			"x-fc-root",
			"x-asterisk",
			"x-ht-root",
			"x-tfwh-root",
		]);
	});

	it("[ISSUE-3483-ITEM-11] passes a selector's textFieldClasses on to its text field", async () => {
		wrap(
			<SingleSelect
				label="Country"
				onLoad={selectorLocalLoadHandler([])}
				selected={null}
				onSelect={vi.fn()}
				textFieldClasses={{ root: "x-selector-root" }}
			/>,
		);
		const input = await screen.findByRole("combobox", { name: "Country" });
		// the root of the text field the combobox is in, which MUI's TextField puts
		// its classes.root on
		expect(input.closest(".MuiTextField-root")).toHaveClass("x-selector-root");
	});
});

describe("dirty marker in forced colors", () => {
	/**
	 * Splits a selector list at its top-level commas, leaving those inside `:not()`
	 * and the like alone
	 */
	const selectorsOf = (list: string): string[] => {
		const selectors: string[] = [];
		let depth = 0;
		let start = 0;
		for (let i = 0; i < list.length; ++i) {
			if (list[i] === "(") ++depth;
			else if (list[i] === ")") --depth;
			else if (list[i] === "," && depth === 0) {
				selectors.push(list.slice(start, i).trim());
				start = i + 1;
			}
		}
		selectors.push(list.slice(start).trim());
		return selectors;
	};

	/**
	 * What the page's `@media (forced-colors: active)` rules declare for `element`, or
	 * for its `::after`, a later rule overriding an earlier one (specificity is not
	 * weighed). jsdom matches no media feature, so they are read from the style sheets.
	 * Forced colors paint every background in the page's background colour, so these
	 * rules are what keeps a dot drawn as a background visible.
	 */
	const forcedColors = (element: Element, pseudo: "" | "::after" = "") => {
		const declared: Record<string, string> = {};
		const rules = Array.from(document.styleSheets)
			.flatMap((sheet) => Array.from(sheet.cssRules))
			.filter(
				(rule): rule is CSSMediaRule =>
					rule instanceof window.CSSMediaRule &&
					rule.media.mediaText.includes("forced-colors: active"),
			)
			.flatMap((rule) => Array.from(rule.cssRules))
			.filter(
				(rule): rule is CSSStyleRule => rule instanceof window.CSSStyleRule,
			);
		for (const rule of rules) {
			const applies = selectorsOf(rule.selectorText).some((selector) =>
				pseudo
					? selector.endsWith(pseudo) &&
						element.matches(selector.slice(0, -pseudo.length))
					: !selector.includes("::") && element.matches(selector),
			);
			if (!applies) continue;
			for (const name of Array.from(rule.style))
				declared[name] = rule.style.getPropertyValue(name);
		}
		return {
			forcedColorAdjust: declared["forced-color-adjust"],
			backgroundColor: declared["background-color"]?.toLowerCase(),
		};
	};

	it.each([
		[
			"a standard text field",
			<TextFieldCC
				key={"field"}
				label="Serial"
				value="x"
				variant="standard"
				dirty
			/>,
			".MuiInputLabel-root",
		],
		[
			"an outlined text field",
			<TextFieldCC
				key={"field"}
				label="Serial"
				value="x"
				variant="outlined"
				dirty
			/>,
			".MuiInputLabel-root",
		],
		[
			"a label component",
			<FormLabelCC key={"field"} dirty>
				Serial
			</FormLabelCC>,
			".MuiFormLabel-root",
		],
		[
			"a checkbox",
			<FormControlCC key={"field"} dirty>
				<FormControlLabel control={<Checkbox />} label="Serial" />
			</FormControlCC>,
			".MuiFormControlLabel-label",
		],
	] as const)(
		"[ISSUE-3483-ITEM-21] keeps the dot after the label of %s in forced colors, in the text colour of the user's palette rather than its background colour",
		(_name, field, labelSelector) => {
			const { container } = wrap(field);
			const label = container.querySelector(labelSelector)!;
			expect(label).not.toBeNull();
			expect(forcedColors(label, "::after")).toEqual({
				forcedColorAdjust: "none",
				backgroundColor: "canvastext",
			});
		},
	);

	it("[ISSUE-3483-ITEM-21] keeps the dot of labelWithDirtyMarker in forced colors, in the text colour of the user's palette rather than its background colour", () => {
		const { container } = wrap(
			<span>{labelWithDirtyMarker("Photos", true)}</span>,
		);
		const dot = container.querySelector("[aria-hidden='true']")!;
		expect(dot).not.toBeNull();
		expect(forcedColors(dot)).toEqual({
			forcedColorAdjust: "none",
			backgroundColor: "canvastext",
		});
	});
});
