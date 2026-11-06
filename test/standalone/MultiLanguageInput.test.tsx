import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
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

/** the language codes in the visible multiline label (the outlined legend repeats them) */
const labelCode = (lang: Lang) =>
	document.querySelector<HTMLElement>(`label [data-lang="${lang}"]`)!;

const type = (el: Element | null, value: string) =>
	fireEvent.change(el!, { target: { value } });

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
});
