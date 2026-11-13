import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor } from "storybook/test";
import { Box, Button } from "@mui/material";
import ccI18n from "../../../i18n";
import MultiLanguageInput from "./MultiLanguageInput";

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
 *   button is red.
 * - **Multiline** (`multiline`) shows one textarea; the language buttons
 *   below it switch the language it edits (the pressed one is shown).
 *
 * Every field is named with the label and its language ("Title (German)"),
 * and the fields are a group named by the label.
 *
 * The default language is the components-care UI language when it is in
 * `enabledLanguages` and `ignoreI18nLocale` is not set, otherwise
 * `enabledLanguages[0]`. The stories set `ignoreI18nLocale`, so `en` comes
 * first. Apps render it with `variant="standard"` (the theme default in SCF
 * and IMF); the stories pass it. The stories hold the values in state, as a
 * form would; `values` in the controls sets the starting values.
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
				"The editable languages, in display order; non-empty, no duplicates. enabledLanguages[0] is the default language unless the UI language is listed (and ignoreI18nLocale is not set)",
			control: "object",
		},
		ignoreI18nLocale: {
			description:
				"Always make enabledLanguages[0] the default language, whatever the UI language",
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
				"Marks the default language's field required (asterisk, native required); validates nothing",
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

const TOGGLE = "Toggle language inputs";

const field = (root: HTMLElement, name: string) =>
	root.querySelector<HTMLInputElement & HTMLTextAreaElement>(
		`input[name="${name}"], textarea[name="${name}"]`,
	);

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
