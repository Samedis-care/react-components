import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { computeAccessibleName } from "dom-accessibility-api";
import ccI18n from "../../src/i18n";
import MultiLanguageInput, {
	MultiLanguageInputProps,
	MultiLanguageInputSupportedLanguages,
} from "../../src/standalone/UIKit/InputControls/MultiLanguageInput";

/**
 * MultiLanguageInput: one text per language. Single-line shows the default
 * language's field, and a toggle at its end shows the other languages' fields
 * below it. Multiline shows one textarea, and the language codes after the
 * label switch the language it edits. The default language is the
 * components-care UI language when it is enabled (and ignoreI18nLocale is not
 * set), otherwise enabledLanguages[0]. jsdom's UI language is en-US, so "en".
 */

type Values = MultiLanguageInputProps["values"];

type Lang = MultiLanguageInputSupportedLanguages;

beforeAll(async () => {
	// the language names are a namespace of their own that loads on first use;
	// loading it here keeps the first render of each test from suspending
	await ccI18n.loadNamespaces(["translation", "languages"]);
});

afterEach(async () => {
	cleanup();
	vi.restoreAllMocks();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

const setLanguage = (lng: string) =>
	act(async () => {
		await ccI18n.changeLanguage(lng);
	});

/** Holds the values the way a form does, so a change shows in the fields */
const Controlled = function Controlled(
	props: Partial<MultiLanguageInputProps> & {
		initial: Values;
		spy?: (next: Values) => void;
	},
) {
	const { initial, spy, ...other } = props;
	const [values, setValues] = useState<Values>(initial);
	return (
		<MultiLanguageInput
			enabledLanguages={["en", "de", "fr"]}
			label="Title"
			name="title"
			{...other}
			values={values}
			onChange={(next) => {
				spy?.(next);
				setValues(next);
			}}
		/>
	);
};

const noop = () => {};

/** the input or textarea of a language, by its name attribute */
const field = (name: string) =>
	document.querySelector<HTMLInputElement & HTMLTextAreaElement>(
		`input[name="${name}"], textarea[name="${name}"]`,
	);

/** the names of the rendered language fields, in DOM order */
const fieldNames = () =>
	Array.from(
		document.querySelectorAll<HTMLInputElement>(
			"input[name]:not([type=hidden]), textarea[name]",
		),
	).map((el) => el.name);

const toggle = () =>
	screen.getByRole("button", { name: "Toggle language inputs" });

/**
 * The name of a field whose label reads its language: "Title (German)". jsdom
 * does not blockify the visually hidden (absolutely positioned) language name,
 * so dom-accessibility-api drops the space before it that Chromium keeps.
 */
const labelledName = (label: string, language: string) =>
	new RegExp(`^${label} ?\\(${language}\\)$`);

/** a multiline field's language button */
const labelCode = (lang: Lang) =>
	document.querySelector<HTMLElement>(`button[data-lang="${lang}"]`)!;

const type = (el: Element | null, value: string) =>
	fireEvent.change(el!, { target: { value } });

/** Collects errors that escape event handlers (jsdom reports them on window) */
const collectWindowErrors = () => {
	const errors: string[] = [];
	const onError = (event: ErrorEvent) => {
		const error = event.error as Error | undefined;
		errors.push(String(error?.message ?? event.message));
		event.preventDefault();
	};
	window.addEventListener("error", onError);
	return {
		errors,
		stop: () => window.removeEventListener("error", onError),
	};
};

describe("bugs", () => {
	it("[ISSUE-3486-ITEM-1] shows an empty textarea for a language without a value after switching to it, and saves only what is typed there", () => {
		const spy = vi.fn();
		render(
			<Controlled
				initial={{ en: "Hello" }}
				spy={spy}
				label="Desc"
				name="desc"
				multiline
			/>,
		);
		fireEvent.click(labelCode("de"));
		const textarea = field("desc-de")!;
		expect(textarea).toHaveValue("");
		type(textarea, textarea.value + "X");
		expect(spy).toHaveBeenLastCalledWith({ en: "Hello", de: "X" });
	});
	it("[ISSUE-3486-ITEM-1] shows the new default language's value after the UI language changes", async () => {
		render(<Controlled initial={{ en: "Hello" }} />);
		expect(field("title-en")).toHaveValue("Hello");
		await setLanguage("de");
		expect(fieldNames()).toEqual(["title-de"]);
		expect(field("title-de")).toHaveValue("");
	});
	it("[ISSUE-3486-ITEM-1] empties a field when the parent removes its language from values", () => {
		const props = {
			enabledLanguages: ["en", "de"] as Lang[],
			label: "Title",
			name: "title",
			onChange: noop,
		};
		const { rerender } = render(
			<MultiLanguageInput {...props} values={{ en: "Hello", de: "Hallo" }} />,
		);
		fireEvent.click(toggle());
		rerender(<MultiLanguageInput {...props} values={{ de: "Hallo" }} />);
		expect(field("title-en")).toHaveValue("");
		rerender(<MultiLanguageInput {...props} values={{}} />);
		expect(field("title-de")).toHaveValue("");
	});
	it("[ISSUE-3486-ITEM-1] keeps showing the parent's value when the parent does not apply a change", () => {
		render(
			<MultiLanguageInput
				enabledLanguages={["en", "de"]}
				label="Title"
				name="title"
				values={{}}
				onChange={noop}
			/>,
		);
		type(field("title-en"), "b");
		expect(field("title-en")).toHaveValue("");
	});
	it("[ISSUE-3486-ITEM-1] empties a field when the backend sends its language as null", () => {
		const props = {
			enabledLanguages: ["en", "de"] as Lang[],
			label: "Title",
			name: "title",
			onChange: noop,
		};
		const { rerender } = render(
			<MultiLanguageInput {...props} values={{ en: "Hello" }} />,
		);
		rerender(
			<MultiLanguageInput
				{...props}
				values={{ en: null } as unknown as Values}
			/>,
		);
		expect(field("title-en")).toHaveValue("");
	});
	it("[ISSUE-3486-ITEM-2] keeps required on the default field when the default language changes after mount", () => {
		const props = {
			label: "Title",
			name: "title",
			required: true,
			ignoreI18nLocale: true,
			values: { de: "Pumpe" },
			onChange: noop,
		};
		const { rerender } = render(
			<MultiLanguageInput {...props} enabledLanguages={["en", "de"]} />,
		);
		expect(field("title-en")).toBeRequired();
		rerender(<MultiLanguageInput {...props} enabledLanguages={["de", "en"]} />);
		expect(fieldNames()).toEqual(["title-de"]);
		expect(field("title-de")).toBeRequired();
	});
	it("[ISSUE-3486-ITEM-2] edits the default language in a multiline field mounted before its languages arrived", () => {
		const spy = vi.fn();
		const props = {
			label: "Desc",
			name: "desc",
			multiline: true,
			values: {},
			onChange: spy,
		};
		const { rerender } = render(
			<MultiLanguageInput {...props} enabledLanguages={[]} />,
		);
		rerender(<MultiLanguageInput {...props} enabledLanguages={["en", "de"]} />);
		const caught = collectWindowErrors();
		try {
			expect(fieldNames()).toEqual(["desc-en"]);
			type(field("desc-en"), "x");
		} finally {
			caught.stop();
		}
		expect(caught.errors).toEqual([]);
		expect(spy).toHaveBeenLastCalledWith({ en: "x" });
	});
	it("[ISSUE-3486-ITEM-2] falls back to the default language when the active one is no longer enabled", () => {
		const spy = vi.fn();
		const props = {
			label: "Desc",
			name: "desc",
			multiline: true,
			values: { en: "Hello", de: "Hallo" },
			onChange: spy,
		};
		const { rerender } = render(
			<MultiLanguageInput {...props} enabledLanguages={["en", "de"]} />,
		);
		fireEvent.click(labelCode("de"));
		rerender(<MultiLanguageInput {...props} enabledLanguages={["en", "fr"]} />);
		const caught = collectWindowErrors();
		try {
			expect(fieldNames()).toEqual(["desc-en"]);
			expect(field("desc-en")).toHaveValue("Hello");
			type(field("desc-en"), "Hello!");
		} finally {
			caught.stop();
		}
		expect(caught.errors).toEqual([]);
		expect(spy).toHaveBeenLastCalledWith({ en: "Hello!", de: "Hallo" });
	});
	it("[ISSUE-3486-ITEM-2] moves required to the new default field when the UI language changes after mount", async () => {
		render(<Controlled initial={{ en: "Pump", de: "Pumpe" }} required />);
		expect(field("title-en")).toBeRequired();
		await setLanguage("de");
		expect(fieldNames()).toEqual(["title-de"]);
		expect(field("title-de")).toBeRequired();
		// the toggle's name is German now
		fireEvent.click(screen.getByRole("button"));
		expect(fieldNames()).toEqual(["title-de", "title-en", "title-fr"]);
		expect(field("title-en")).not.toBeRequired();
		expect(field("title-fr")).not.toBeRequired();
		// and back, while expanded
		await setLanguage("en");
		expect(fieldNames()).toEqual(["title-en", "title-de", "title-fr"]);
		expect(field("title-en")).toBeRequired();
		expect(field("title-de")).not.toBeRequired();
		fireEvent.click(toggle());
		expect(fieldNames()).toEqual(["title-en"]);
	});
	it("[ISSUE-3486-ITEM-2] shows the new default language in a multiline field when the UI language changes before a code was clicked", async () => {
		render(
			<Controlled
				initial={{ en: "Hello", de: "Hallo" }}
				label="Desc"
				name="desc"
				multiline
				required
			/>,
		);
		expect(field("desc-en")).toHaveValue("Hello");
		await setLanguage("de");
		expect(fieldNames()).toEqual(["desc-de"]);
		expect(field("desc-de")).toHaveValue("Hallo");
		expect(field("desc-de")).toBeRequired();
		// the active language's button is pressed
		expect(labelCode("de")).toHaveAttribute("aria-pressed", "true");
		expect(labelCode("en")).toHaveAttribute("aria-pressed", "false");
	});
	it("[ISSUE-3486-ITEM-2] keeps a clicked language in a multiline field when the default language changes", async () => {
		render(
			<Controlled
				initial={{ en: "Hello", de: "Hallo", fr: "Bonjour" }}
				label="Desc"
				name="desc"
				multiline
			/>,
		);
		fireEvent.click(labelCode("fr"));
		await setLanguage("de");
		expect(fieldNames()).toEqual(["desc-fr"]);
		expect(field("desc-fr")).toHaveValue("Bonjour");
	});

	it("[ISSUE-3486-ITEM-9] exposes the multiline language codes as focusable controls with the active one marked", () => {
		render(
			<MultiLanguageInput
				enabledLanguages={["en", "de"]}
				label="Desc"
				name="desc"
				multiline
				variant="standard"
				values={{}}
				onChange={noop}
			/>,
		);
		const control = (name: RegExp) =>
			screen.queryByRole("tab", { name }) ??
			screen.queryByRole("radio", { name }) ??
			screen.queryByRole("button", { name });
		const isOn = (el: HTMLElement | null) =>
			[
				el?.getAttribute("aria-selected"),
				el?.getAttribute("aria-pressed"),
				el?.getAttribute("aria-checked"),
			].includes("true");
		const en = control(/English/);
		const de = control(/German/);
		expect(en, "a control for English").not.toBeNull();
		expect(de, "a control for German").not.toBeNull();
		expect(isOn(en)).toBe(true);
		expect(isOn(de)).toBe(false);
		fireEvent.click(de!);
		expect(isOn(control(/German/))).toBe(true);
	});

	it("[ISSUE-3486-ITEM-9] names the multiline textarea with the language it edits", () => {
		render(
			<MultiLanguageInput
				enabledLanguages={["en", "de"]}
				label="Desc"
				name="desc"
				multiline
				variant="standard"
				values={{}}
				onChange={noop}
			/>,
		);
		// jest-dom's matcher: dom-accessibility-api's types do not resolve here
		const textarea = () => document.querySelector("textarea[name]")!;
		expect(textarea()).toHaveAccessibleName(/English/);
		expect(textarea()).not.toHaveAccessibleName(/German/);
		fireEvent.click(labelCode("de"));
		expect(textarea()).toHaveAccessibleName(/German/);
		expect(textarea()).not.toHaveAccessibleName(/English/);
	});

	it("[ISSUE-3486-ITEM-9] groups the language buttons under the field's label, and keeps them usable while the field is disabled", async () => {
		render(
			<Controlled
				initial={{ en: "Hello", de: "Hallo" }}
				label="Desc"
				name="desc"
				multiline
				disabled
			/>,
		);
		const group = screen.getByRole("group", { name: "Language of Desc" });
		const buttons = within(group).getAllByRole("button");
		expect(buttons.map((button) => button.textContent)).toEqual([
			"en",
			"de",
			"fr",
		]);
		for (const button of buttons) expect(button).toBeEnabled();
		fireEvent.click(labelCode("de"));
		expect(field("desc-de")).toHaveValue("Hallo");
		expect(field("desc-de")).toBeDisabled();
		expect(labelCode("de")).toHaveAttribute("aria-pressed", "true");
		await setLanguage("de");
		expect(
			screen.getByRole("group", { name: "Sprache für Desc" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3486-ITEM-10] names every language field with the label and its language", () => {
		render(
			<MultiLanguageInput
				enabledLanguages={["en", "de", "fr"]}
				label="Title"
				name="title"
				variant="standard"
				values={{}}
				onChange={noop}
			/>,
		);
		fireEvent.click(toggle());
		const names = ["en", "de", "fr"].map((lang) =>
			computeAccessibleName(field(`title-${lang}`)!),
		);
		expect(names[0]).toMatch(/Title.*English|English.*Title/);
		expect(names[1]).toMatch(/Title.*German|German.*Title/);
		expect(names[2]).toMatch(/Title.*French|French.*Title/);
	});

	it("[ISSUE-3486-ITEM-10] names the fields in the UI language rather than after the placeholder", async () => {
		render(
			<Controlled
				initial={{}}
				placeholder="Enter a title"
				variant="standard"
			/>,
		);
		fireEvent.click(toggle());
		expect(field("title-en")).toHaveAccessibleName(
			labelledName("Title", "English"),
		);
		expect(field("title-de")).toHaveAccessibleName("Title (German)");
		expect(field("title-fr")).toHaveAccessibleName("Title (French)");
		// the UI language makes German the default language, and names the languages
		await setLanguage("de");
		expect(fieldNames()).toEqual(["title-de", "title-en", "title-fr"]);
		expect(field("title-de")).toHaveAccessibleName(
			labelledName("Title", "Deutsch"),
		);
		expect(field("title-en")).toHaveAccessibleName("Title (Englisch)");
		expect(field("title-fr")).toHaveAccessibleName("Title (Französisch)");
	});

	it("[ISSUE-3486-ITEM-10] names the fields after their language alone when there is no label", () => {
		render(
			<Controlled
				initial={{}}
				label={undefined}
				placeholder="Enter a title"
				variant="standard"
			/>,
		);
		fireEvent.click(toggle());
		expect(field("title-en")).toHaveAccessibleName("English");
		expect(field("title-de")).toHaveAccessibleName("German");
		expect(field("title-fr")).toHaveAccessibleName("French");
		cleanup();
		render(<Controlled initial={{}} label={undefined} name="desc" multiline />);
		expect(field("desc-en")).toHaveAccessibleName("English");
		fireEvent.click(labelCode("de"));
		expect(field("desc-de")).toHaveAccessibleName("German");
	});

	it("[ISSUE-3486-ITEM-10] puts the language fields in a group named by the label", () => {
		render(<Controlled initial={{}} variant="standard" />);
		const group = screen.getByRole("group", { name: "Title" });
		expect(group).toContainElement(field("title-en"));
		expect(group).toContainElement(toggle());
		fireEvent.click(toggle());
		expect(group).toContainElement(field("title-de"));
		expect(group).toContainElement(field("title-fr"));
	});

	it("[ISSUE-3486-ITEM-10] puts a multiline field and its language buttons in a group named by the label", () => {
		render(<Controlled initial={{}} label="Desc" name="desc" multiline />);
		const group = screen.getByRole("group", { name: "Desc" });
		expect(group).toContainElement(field("desc-en"));
		expect(group).toContainElement(
			screen.getByRole("group", { name: "Language of Desc" }),
		);
	});
});
