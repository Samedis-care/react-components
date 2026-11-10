import React, { Suspense, useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor, within } from "storybook/test";
import { Box } from "@mui/material";
import ccI18n, { langs } from "../../i18n";
import useCountryOptions from "./useCountryOptions";
import CountryFlags from "./index";
import {
	BaseSelectorData,
	selectorLocalLoadHandler,
	SingleSelect,
} from "../Selector";

interface CountrySelectArgs {
	language: string;
}

/** A SingleSelect whose options come from useCountryOptions() */
const CountrySelect = function CountrySelect() {
	const countries = useCountryOptions();
	const onLoad = useMemo(
		() => selectorLocalLoadHandler(countries),
		[countries],
	);
	const [selected, setSelected] = useState<BaseSelectorData | null>(null);
	return (
		<SingleSelect
			label="Country"
			selected={selected}
			onSelect={setSelected}
			onLoad={onLoad}
			enableIcons
		/>
	);
};

/** Switches components-care's language when the control changes */
const InLanguage = function InLanguage(
	props: CountrySelectArgs & { children: React.ReactNode },
) {
	const { language, children } = props;
	useEffect(() => {
		void ccI18n.changeLanguage(language);
	}, [language]);
	return (
		<Box sx={{ width: 320 }}>
			<Suspense fallback="Loading…">{children}</Suspense>
		</Box>
	);
};

/**
 * `useCountryOptions()` returns the countries of `CountryCodes` as select
 * options, `{ value: code, label: name, icon: flag URL }`, sorted by their name
 * in components-care's current language with that language's collation. The
 * options fit the Selector as they are; `enableIcons` shows the flags.
 */
const meta: Meta<CountrySelectArgs> = {
	title: "Standalone/CountryOptions",
	// the country names are a namespace that loads on first use
	loaders: [
		async ({ args }) => {
			await ccI18n.changeLanguage(args.language);
			await ccI18n.loadNamespaces(["translation", "countries"]);
			return {};
		},
	],
	parameters: {
		a11y: { test: "error" },
	},
	args: { language: "de" },
	argTypes: {
		language: {
			description:
				"components-care's language (`ComponentsCareI18n.changeLanguage`), which names and sorts the countries",
			control: "select",
			options: langs,
		},
	},
	render: ({ language }) => (
		<InLanguage language={language}>
			<CountrySelect />
		</InLanguage>
	),
};
export default meta;

type Story = StoryObj<CountrySelectArgs>;

/** the names of the listed options, in list order */
const optionNames = () =>
	within(document.body)
		.getAllByRole("option")
		.map((option) => option.textContent);

export const German: Story = {
	play: async ({ canvas, userEvent }) => {
		const input = canvas.getByRole("combobox", { name: "Country" });
		await userEvent.click(input);
		// sorted by the German name, Ä among the A
		await waitFor(() =>
			expect(optionNames().slice(0, 4)).toEqual([
				"Afghanistan",
				"Ägypten",
				"Albanien",
				"Algerien",
			]),
		);
		await userEvent.type(input, "Österr");
		const option = await within(document.body).findByRole("option", {
			name: "Österreich",
		});
		// the flag is decorative: the option's name is the country's
		const flag = option.querySelector("img");
		await expect(flag).toHaveAttribute("src", CountryFlags.AT);
		await expect(flag).toHaveAttribute("alt", "");
		await userEvent.keyboard("{ArrowDown}{Enter}");
		await waitFor(() => expect(input).toHaveValue("Österreich"));
	},
};

export const English: Story = {
	args: { language: "en" },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("combobox", { name: "Country" }));
		await waitFor(() =>
			expect(optionNames().slice(0, 4)).toEqual([
				"Afghanistan",
				"Albania",
				"Algeria",
				"American Samoa",
			]),
		);
	},
};
