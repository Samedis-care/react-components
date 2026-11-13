import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import {
	BaseSelectorData,
	BaseSelectorProps,
	selectorLocalLoadHandler,
} from "../../src/standalone/Selector/BaseSelector";
import SingleSelect from "../../src/standalone/Selector/SingleSelect";
import ccI18n from "../../src/i18n";

// jsdom has "ontouchstart" on window, so TextFieldWithHelp would add its touch
// Clear button next to Autocomplete's own one
vi.mock("../../src/utils/isTouchDevice", () => ({ default: () => false }));

afterEach(async () => {
	cleanup();
	vi.restoreAllMocks();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

const WARNING_COLOR = "rgb(237, 108, 2)";
const theme = createTheme({ palette: { warning: { main: WARNING_COLOR } } });

/** lets the option loads started by the last event settle */
const flush = async () => {
	for (let i = 0; i < 10; i++) await act(() => Promise.resolve());
};

const COUNTRIES: BaseSelectorData[] = [
	{ value: "de", label: "Germany", group: "EU" },
	{ value: "fr", label: "France", group: "EU" },
	{ value: "gb", label: "United Kingdom" },
	{ value: "us", label: "United States", group: "ZZ" },
];
const GERMANY = COUNTRIES[0];
const FRANCE = COUNTRIES[1];
const loadCountries = selectorLocalLoadHandler(COUNTRIES);

type SingleProps = BaseSelectorProps<BaseSelectorData, false>;
type HostProps = Partial<Omit<SingleProps, "selected" | "onSelect">> & {
	initial?: BaseSelectorData | null;
	onSel?: (value: BaseSelectorData | null) => void;
};

/** a controlled SingleSelect, labelled "Country", over COUNTRIES */
const Host = ({ initial = null, onSel, ...other }: HostProps) => {
	const [selected, setSelected] = useState<BaseSelectorData | null>(initial);
	return (
		<SingleSelect
			label="Country"
			onLoad={loadCountries}
			{...other}
			selected={selected}
			onSelect={(value) => {
				onSel?.(value);
				setSelected(value);
			}}
		/>
	);
};

const renderUi = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

const combobox = () => screen.getByRole<HTMLInputElement>("combobox");

/** renders, focuses the input (typing needs focus) and opens the list */
const mountOpen = async (ui: React.ReactElement) => {
	const result = renderUi(ui);
	await flush();
	const input = combobox();
	act(() => input.focus());
	fireEvent.mouseDown(input);
	await flush();
	return { input, ...result };
};

const type = async (input: HTMLInputElement, text: string) => {
	fireEvent.change(input, { target: { value: text } });
	await flush();
};

const key = async (input: HTMLInputElement, keyName: string) => {
	fireEvent.keyDown(input, { key: keyName });
	await flush();
};

describe("BaseSelector bugs", () => {
	it("[ISSUE-3487-ITEM-1] keeps the selected record when the user tabs through a freeSolo selector", async () => {
		const onSel = vi.fn();
		renderUi(<Host freeSolo initial={GERMANY} onSel={onSel} />);
		await flush();
		const input = combobox();
		act(() => input.focus());
		await flush();
		act(() => input.blur());
		await flush();
		expect(onSel).not.toHaveBeenCalled();
	});

	it("[ISSUE-3487-ITEM-1] does not call onSelect when a freeSolo selector holding a copy of the record is opened and left", async () => {
		// BackendSingleSelect passes such a copy; opening highlights the
		// selection, and leaving the field commits that highlight
		const onSel = vi.fn();
		const { input } = await mountOpen(
			<Host freeSolo initial={{ ...GERMANY }} onSel={onSel} />,
		);
		act(() => input.blur());
		await flush();
		expect(onSel).not.toHaveBeenCalled();
	});

	it("[ISSUE-3487-ITEM-1] keeps the selection when a freeSolo selector is left while Create is highlighted", async () => {
		const onSel = vi.fn();
		const { input } = await mountOpen(
			<Host freeSolo initial={GERMANY} onAddNew={() => null} onSel={onSel} />,
		);
		// ArrowUp wraps to the last entry, Create
		await key(input, "ArrowUp");
		act(() => input.blur());
		await flush();
		expect(onSel).not.toHaveBeenCalled();
	});

	it("[ISSUE-3487-ITEM-1] shows the selection again after a freeSolo selector is left while Create is highlighted", async () => {
		const onAddNew = vi.fn(() => null);
		const { input } = await mountOpen(
			<Host freeSolo initial={GERMANY} onAddNew={onAddNew} />,
		);
		await key(input, "ArrowUp");
		act(() => input.blur());
		await flush();
		expect(input).toHaveValue("Germany");
		expect(onAddNew).not.toHaveBeenCalled();
	});

	it("[ISSUE-3487-ITEM-1] keeps a free-text selection when the user tabs through a freeSolo selector", async () => {
		const onSel = vi.fn();
		renderUi(
			<Host
				freeSolo
				initial={{ value: "Narnia", label: "Narnia", freeSolo: true }}
				onSel={onSel}
			/>,
		);
		await flush();
		const input = combobox();
		expect(input).toHaveValue("Narnia");
		act(() => input.focus());
		act(() => input.blur());
		await flush();
		expect(onSel).not.toHaveBeenCalled();
	});

	it("[ISSUE-3487-ITEM-1] commits typed text as free text when an empty freeSolo selector is left", async () => {
		const onSel = vi.fn();
		const { input } = await mountOpen(<Host freeSolo onSel={onSel} />);
		await type(input, "Narnia");
		act(() => input.blur());
		await flush();
		expect(onSel.mock.calls).toEqual([
			[{ value: "Narnia", label: "Narnia", freeSolo: true }],
		]);
		expect(input).toHaveValue("Narnia");
	});

	it("[ISSUE-3487-ITEM-1] selects the option whose label was typed when an empty freeSolo selector is left", async () => {
		const onSel = vi.fn();
		const { input } = await mountOpen(<Host freeSolo onSel={onSel} />);
		await type(input, "France");
		act(() => input.blur());
		await flush();
		expect(onSel).toHaveBeenCalledTimes(1);
		expect(onSel.mock.calls[0][0]).toBe(FRANCE);
	});

	it("[ISSUE-3487-ITEM-1] keeps typed text that only a disabled option has as its label as free text", async () => {
		const onSel = vi.fn();
		const { input } = await mountOpen(
			<Host
				freeSolo
				onSel={onSel}
				onLoad={() => ({ options: [{ ...FRANCE, isDisabled: true }] })}
			/>,
		);
		await type(input, "France");
		act(() => input.blur());
		await flush();
		expect(onSel.mock.calls).toEqual([
			[{ value: "France", label: "France", freeSolo: true }],
		]);
	});

	it("[ISSUE-3487-ITEM-1] commits the option reached with the arrow keys when a freeSolo selector is left", async () => {
		const onSel = vi.fn();
		const { input } = await mountOpen(
			<Host freeSolo initial={GERMANY} onSel={onSel} />,
		);
		// the list opens on the selection, Germany; ArrowDown moves on to France
		await key(input, "ArrowDown");
		act(() => input.blur());
		await flush();
		expect(onSel).toHaveBeenCalledTimes(1);
		expect(onSel.mock.calls[0][0]).toBe(FRANCE);
	});

	it("[ISSUE-3487-ITEM-17] names the combobox and its listbox with the label, with and without a selection", async () => {
		renderUi(<Host />);
		await flush();
		expect(screen.getByRole("combobox", { name: "Country" })).toBe(combobox());
		cleanup();
		const { input } = await mountOpen(<Host initial={GERMANY} />);
		expect(screen.getByRole("combobox", { name: "Country" })).toBe(input);
		expect(
			screen.getByRole("listbox", { name: "Country" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3487-ITEM-17] ties the label to the input that has the autocompleteId", async () => {
		const { input } = await mountOpen(<Host autocompleteId="country-input" />);
		expect(input).toHaveAttribute("id", "country-input");
		const label = screen.getByText("Country").closest("label");
		expect(label).toHaveAttribute("for", "country-input");
		expect(label).toHaveAttribute("id", "country-input-label");
		expect(screen.getByRole("listbox")).toHaveAttribute(
			"aria-labelledby",
			"country-input-label",
		);
	});

	it("[ISSUE-3487-ITEM-17] names each of several selectors without autocompleteId by its own label", async () => {
		renderUi(
			<>
				<Host />
				<Host label="Country of birth" initial={GERMANY} />
			</>,
		);
		await flush();
		const [first, second] = screen.getAllByRole("combobox");
		expect(first.id).not.toBe(second.id);
		expect(screen.getByRole("combobox", { name: "Country" })).toBe(first);
		expect(screen.getByRole("combobox", { name: "Country of birth" })).toBe(
			second,
		);
	});

	it("[ISSUE-3487-ITEM-17] names the combobox by its label when autocompleteId is empty", async () => {
		renderUi(<Host autocompleteId="" />);
		await flush();
		expect(combobox().id).not.toBe("");
		expect(screen.getByRole("combobox", { name: "Country" })).toBe(combobox());
	});
});
