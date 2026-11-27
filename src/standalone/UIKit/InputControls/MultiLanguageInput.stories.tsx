import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor } from "storybook/test";
import { Box, Button, decomposeColor, getContrastRatio } from "@mui/material";
import ccI18n from "../../../i18n";
import MultiLanguageInput from "./MultiLanguageInput";
import {
	edgesPast,
	pageScrollsSideways,
} from "../../../stories/test-utils/hiddenTextLayout";

type Props = React.ComponentProps<typeof MultiLanguageInput>;

/** Holds the values the way a form does, so a change shows in the fields */
const StatefulMultiLanguageInput = function StatefulMultiLanguageInput(
	props: Props,
) {
	const { values: initial, onChange, ...other } = props;
	const [values, setValues] = useState(initial);
	return (
		<MultiLanguageInput
			{...other}
			values={values}
			onChange={(next) => {
				onChange?.(next);
				setValues(next);
			}}
		/>
	);
};

/** The component between two buttons, for keyboard walks */
const BetweenButtons = function BetweenButtons(props: Props) {
	return (
		<Box sx={{ display: "grid", gap: 2, maxWidth: 480 }}>
			<Button variant="outlined">Before</Button>
			<StatefulMultiLanguageInput {...props} />
			<Button variant="outlined">After</Button>
		</Box>
	);
};

/**
 * A text field with one value per language, for localized strings
 * (`{ en: "…", de: "…" }`).
 *
 * - **Single-line** shows the default language's field, with its code as start
 *   adornment. The translate button at its end shows the other enabled
 *   languages' fields below it; while any enabled language is empty, the
 *   button is red. The button says which field it belongs to ("Show
 *   translations of Title") as its name and its tooltip, and reports whether
 *   the fields are shown with `aria-expanded`.
 * - **Multiline** (`multiline`) shows one textarea; the language buttons
 *   below it switch the language it edits (the pressed one is shown).
 *
 * Every field is named with the label and its language ("Title (German)"),
 * and the fields are a group named by the label.
 *
 * The default language is `defaultLanguage` (the language the record has to
 * be filled in) when it is in `enabledLanguages`; otherwise the components-care
 * UI language when it is in `enabledLanguages` and `ignoreI18nLocale` is not
 * set; otherwise `enabledLanguages[0]`. The stories set `ignoreI18nLocale`, so
 * `en` comes first unless a story sets `defaultLanguage`. While the default
 * language is empty and another language has text, a single-line field shows
 * the other languages' fields until the user presses the translate button or
 * types. Apps render it with `variant="standard"` (their themes' default);
 * the stories pass it. The stories hold the values in state, as a form would;
 * `values` in the controls sets the starting values.
 */
const meta: Meta<typeof MultiLanguageInput> = {
	title: "Standalone/UIKit/InputControls/MultiLanguageInput",
	component: MultiLanguageInput,
	// the language names (tooltips) are a namespace that loads on first use
	loaders: [
		async () => {
			await ccI18n.changeLanguage("en");
			await ccI18n.loadNamespaces(["translation", "languages"]);
			return {};
		},
	],
	parameters: {
		layout: "padded",
		// every story of this file must pass axe
		a11y: { test: "error" },
	},
	args: {
		enabledLanguages: ["en", "de", "fr"],
		ignoreI18nLocale: true,
		label: "Title",
		name: "title",
		variant: "standard",
		values: { en: "Infusion pump" },
		onChange: fn(),
		onBlur: fn(),
	},
	argTypes: {
		enabledLanguages: {
			description:
				"The editable languages, in display order; a repeated one shows once, and while the list is empty (languages still loading) the field shows disabled. The default language is defaultLanguage when listed, else the UI language when listed (and ignoreI18nLocale is not set), else enabledLanguages[0]",
			control: "object",
		},
		defaultLanguage: {
			description:
				"The language the record has to be filled in: the first, labelled and required field for every viewer, whatever the UI language; ignored while null or not enabled",
			control: "select",
			options: ["en", "de", "fr"],
		},
		ignoreI18nLocale: {
			description:
				"Make enabledLanguages[0] the default language instead of the UI language; defaultLanguage wins over it",
			control: "boolean",
		},
		values: {
			description:
				'The text per language, e.g. { en: "Pump", de: "Pumpe" }; {} for none, never null',
			control: "object",
		},
		onChange: {
			description:
				"(newValues) on every keystroke: a new object with the edited language set to the text as typed, or its key removed when emptied; all other keys copied",
		},
		onBlur: {
			description:
				"Called on the container when a language field, the toggle or a language button loses focus",
		},
		label: {
			description:
				"Label of the default language's field, or of the multiline textarea; also the name of the group of fields and, with its language, of every field",
			control: "text",
		},
		multiline: {
			description:
				"One textarea whose language is switched with the language buttons below it, instead of one field per language",
			control: "boolean",
		},
		required: {
			description:
				"Marks the default language's field required (asterisk, native required); validates nothing, pair it with validateLocalizedPresenceFor([defaultLanguage])",
			control: "boolean",
		},
		disableIncompleteMarker: {
			description:
				"Single-line: keeps the translate button from turning red while an enabled language is empty",
			control: "boolean",
		},
		disabled: {
			description:
				"Disables every language field; the toggle and the multiline language buttons still show the other languages",
			control: "boolean",
		},
		error: {
			description: "Marks every language field invalid",
			control: "boolean",
		},
		warning: {
			description: "Shows every language field in the warning colour",
			control: "boolean",
		},
		dirty: {
			description:
				"Marks every language field modified (the dot shows on the labelled field only)",
			control: "boolean",
		},
	},
	render: (args) => (
		<StatefulMultiLanguageInput key={JSON.stringify(args.values)} {...args} />
	),
};
export default meta;

type Story = StoryObj<typeof MultiLanguageInput>;

// the toggle is named after its field, e.g. "Show translations of Title"
const TOGGLE = /Show translations of Title/;

const field = (root: HTMLElement, name: string) =>
	root.querySelector<HTMLInputElement & HTMLTextAreaElement>(
		`input[name="${name}"], textarea[name="${name}"]`,
	);

// an outline colour composited over white paper
const overPaper = (color: string) => {
	const [r, g, b, a = 1] = decomposeColor(color).values;
	const over = (channel: number) => Math.round(channel * a + 255 * (1 - a));
	return `rgb(${over(r)}, ${over(g)}, ${over(b)})`;
};

const focusRing = (el: Element) => {
	const style = getComputedStyle(el);
	if (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0)
		return { outline: style.outlineColor };
	if (style.boxShadow !== "none") return { shadow: style.boxShadow };
	return null;
};

export const Issue3486Item3NoLanguagesYet: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3486-ITEM-3: while `enabledLanguages` is empty, e.g. while an app loads its languages, the field shows disabled with its label. The language code and the translate button appear with the languages.",
			},
		},
	},
	args: {
		enabledLanguages: [],
		required: true,
		values: {},
	},
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("textbox", { name: "Title" }),
		).toBeDisabled();
		await expect(canvas.queryByRole("button")).toBeNull();
	},
};

export const Issue3486Item9MultilineLanguageByKeyboard: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3486-ITEM-9: the language codes of a multiline field are plain text with a click handler, so Tab never reaches them and a keyboard user can only edit the default language (WCAG 2.1.1). Expected: a language switcher that Tab reaches and Enter operates.",
			},
		},
	},
	args: {
		label: "Description",
		name: "description",
		multiline: true,
		minRows: 2,
		values: { en: "Delivers fluids", de: "Fördert Flüssigkeiten" },
	},
	render: (args) => <BetweenButtons {...args} />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const before = await canvas.findByRole("button", { name: "Before" });
		const after = canvas.getByRole("button", { name: "After" });
		before.focus();
		const isGerman = (el: Element | null) =>
			!!el &&
			(el.textContent?.trim() === "de" ||
				/German/.test(el.getAttribute("aria-label") ?? ""));
		// Tab through the control, looking for something that switches to German;
		// in a group of buttons (MUI's roving focus) the arrow keys move between them
		let german: Element | null = null;
		for (let step = 0; step < 6 && !german; step++) {
			await userEvent.tab();
			const focused = document.activeElement;
			if (focused === after) break;
			if (focused?.closest('[role="group"]'))
				for (let move = 0; move < 4; move++) {
					if (isGerman(document.activeElement)) break;
					await userEvent.keyboard("{ArrowRight}");
				}
			if (isGerman(document.activeElement)) german = document.activeElement;
		}
		await expect(german, "Tab reaches no control for German").not.toBeNull();
		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(field(canvasElement, "description-de")).toHaveValue(
				"Fördert Flüssigkeiten",
			),
		);
	},
};

export const Issue3486Item9LanguageButtonFocusRing: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3486-ITEM-9: the multiline language buttons show a focus ring on keyboard focus, also in forced colors (an outline).",
			},
		},
	},
	args: {
		label: "Description",
		name: "description",
		multiline: true,
		values: { en: "Delivers fluids" },
	},
	play: async ({ canvas, userEvent }) => {
		const textarea = await canvas.findByRole("textbox", {
			name: /Description/,
		});
		textarea.focus();
		await userEvent.tab();
		await userEvent.keyboard("{ArrowRight}");
		const german = canvas.getByRole("button", { name: /German/ });
		await waitFor(() => expect(german).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(german);
		await expect(style.outlineStyle).toBe("solid");
		await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
	},
};

export const Issue3486Item10ExpandedFieldsAreNamed: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3486-ITEM-10: the other languages' fields have no label, only a code adornment; axe reports `label` (critical) for each of them (WCAG 1.3.1, 4.1.2). Expected: every field named with the label and its language.",
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(await canvas.findByRole("button", { name: TOGGLE }));
		await waitFor(() =>
			expect(field(canvasElement, "title-fr")).not.toBeNull(),
		);
	},
};

/**
 * Every language field is named with the label and its language, inside a
 * group named by the label (exact names: Chromium keeps the space before the
 * visually hidden language name, which jsdom drops)
 */
export const Issue3486Item10FieldNames: Story = {
	play: async ({ canvas, userEvent }) => {
		const group = await canvas.findByRole("group", { name: "Title" });
		await expect(
			canvas.getByRole("textbox", { name: "Title (English)" }),
		).toHaveValue("Infusion pump");
		await userEvent.click(canvas.getByRole("button", { name: TOGGLE }));
		const german = await canvas.findByRole("textbox", {
			name: "Title (German)",
		});
		const french = canvas.getByRole("textbox", { name: "Title (French)" });
		await expect(group).toContainElement(german);
		await expect(group).toContainElement(french);
	},
};

export const Issue3486Item12ToggleFocusRing: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3486-ITEM-12: keyboard focus on the translate button shows only MUI's faint ripple; there is no outline or ring (WCAG 2.4.7, 1.4.11).",
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const input = await canvas.findByRole("textbox", {
			name: "Title (English)",
		});
		input.focus();
		await userEvent.tab();
		const toggle = canvas.getByRole("button", { name: TOGGLE });
		// keyboard focus as MUI sees it, so the ring is the only open question
		await waitFor(() => expect(toggle).toHaveClass("Mui-focusVisible"));
		const ring = focusRing(toggle);
		await expect(ring, "the toggle shows no focus ring").not.toBeNull();
		if (ring?.outline)
			await expect(
				getContrastRatio(overPaper(ring.outline), "#fff"),
				"the toggle's focus ring is too faint",
			).toBeGreaterThanOrEqual(3);
	},
};

/** The toggle's ring is an outline, which forced colors keep (they drop box-shadows) */
export const Issue3486Item12ToggleFocusRingIsAnOutline: Story = {
	play: async ({ canvas, userEvent }) => {
		const input = await canvas.findByRole("textbox", {
			name: "Title (English)",
		});
		input.focus();
		await userEvent.tab();
		const toggle = canvas.getByRole("button", { name: TOGGLE });
		await waitFor(() => expect(toggle).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(toggle);
		await expect(style.outlineStyle).toBe("solid");
		await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
	},
};

export const Issue3473Item16HiddenLanguageNameStaysInside: Story = {
	args: { variant: "outlined" },
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-16: at 320px in a right-to-left part of a left-to-right page, the visually hidden language name in the label, and in the label's copy in the outline's gap, lies inside the box it is placed in (the nearest positioned ancestor), so it never makes the page scroll sideways. With MUI's visually hidden style, its -1px margin put it 1px past the top and start edges of its container wherever it began the container.",
			},
		},
	},
	decorators: [
		(Story) => (
			<Box dir={"rtl"}>
				<Story />
			</Box>
		),
	],
	play: async ({ canvas }) => {
		const names = await canvas.findAllByText(/\(English\)/);
		for (const name of names) await expect(edgesPast(name)).toEqual([]);
		await expect(pageScrollsSideways()).toBe(false);
	},
};

export const Issue3486Item18RecordLanguageIsRequired: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3486-ITEM-18: `defaultLanguage` is the language the record has to be filled in. Its field comes first, labelled and required, whatever the viewer's UI language.",
			},
		},
	},
	args: {
		defaultLanguage: "de",
		required: true,
		values: { en: "Infusion pump", de: "Infusionspumpe" },
	},
	play: async ({ canvas }) => {
		const german = await canvas.findByRole("textbox", {
			name: "Title (German)",
		});
		await expect(german).toBeRequired();
		await expect(german).toHaveValue("Infusionspumpe");
		await expect(
			canvas.queryByRole("textbox", { name: "Title (English)" }),
		).toBeNull();
	},
};

export const Issue3486Item18TextInAnotherLanguageIsShown: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3486-ITEM-18: a record with text only in a language other than the default one shows the other languages' fields, so the text is not hidden behind the translate button.",
			},
		},
	},
	args: {
		required: true,
		values: { de: "Infusionspumpe" },
	},
	play: async ({ canvas, userEvent }) => {
		await expect(
			await canvas.findByRole("textbox", { name: "Title (German)" }),
		).toHaveValue("Infusionspumpe");
		await expect(
			canvas.getByRole("textbox", { name: "Title (English)" }),
		).toBeRequired();
		const toggle = canvas.getByRole("button", { name: TOGGLE });
		await expect(toggle).toHaveAttribute("aria-expanded", "true");
		await userEvent.click(toggle);
		await waitFor(() =>
			expect(
				canvas.queryByRole("textbox", { name: "Title (German)" }),
			).toBeNull(),
		);
	},
};
