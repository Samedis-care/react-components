import React, { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import {
	getStringLabel,
	selectorLocalLoadHandler,
} from "../../src/standalone/Selector/BaseSelector";
import MultiSelect, {
	MultiSelectorData,
	MultiSelectProps,
} from "../../src/standalone/Selector/MultiSelect";
import ccI18n from "../../src/i18n";

// jsdom has "ontouchstart" on window, so TextFieldWithHelp would add its touch
// Clear button next to Autocomplete's own one
vi.mock("../../src/utils/isTouchDevice", () => ({ default: () => false }));

beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
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

/** lets the option loads and async handlers started by the last event settle */
const flush = async () => {
	for (let i = 0; i < 10; i++) await act(() => Promise.resolve());
};

const FRUITS: MultiSelectorData[] = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
	{ value: "zeta", label: "Zeta" },
];
const [APPLE, , CHERRY, ZETA] = FRUITS;
const loadFruits = selectorLocalLoadHandler(FRUITS);
const byLabel = (a: MultiSelectorData, b: MultiSelectorData) =>
	getStringLabel(a).localeCompare(getStringLabel(b));

/** the values of every array onSelect was called with */
const values = (spy: { mock: { calls: unknown[][] } }) =>
	spy.mock.calls.map((call) =>
		(call[0] as MultiSelectorData[]).map((entry) => entry.value),
	);

const renderUi = (ui: React.ReactElement, theme: Theme = createTheme()) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
const rerenderUi = (
	rerender: (ui: React.ReactElement) => void,
	ui: React.ReactElement,
	theme: Theme = createTheme(),
) => rerender(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const combobox = () => screen.getByRole<HTMLInputElement>("combobox");
/** focuses the input (typing needs focus) and opens the list */
const open = async (input: HTMLElement = combobox()) => {
	act(() => input.focus());
	fireEvent.mouseDown(input);
	await flush();
};
const removeButton = (label: string) =>
	screen.getByRole("button", { name: `Remove ${label}` });
/** the labels of the selected entries, in the order they are listed */
const entryLabels = () =>
	screen
		.getAllByRole("button", { name: /^Remove / })
		.map((button) =>
			(button.getAttribute("aria-label") ?? "").replace(/^Remove /, ""),
		);

type HostProps = Partial<
	Omit<MultiSelectProps<MultiSelectorData>, "selected" | "onSelect">
> & {
	initial?: MultiSelectorData[];
	onSel?: (value: MultiSelectorData[]) => void;
};

/** a controlled MultiSelect, labelled "Fruits", over FRUITS */
const Host = ({ initial = [], onSel, ...other }: HostProps) => {
	const [selected, setSelected] = useState<MultiSelectorData[]>(initial);
	return (
		<MultiSelect
			label="Fruits"
			onLoad={loadFruits}
			{...other}
			selected={selected}
			onSelect={(value) => {
				onSel?.(value);
				setSelected(value);
			}}
		/>
	);
};

describe("MultiSelect bugs", () => {
	it("[ISSUE-3488-ITEM-2] does not reorder the caller's selected array, and onSelect keeps the caller's order", async () => {
		// SCF sets selectedSort for every MultiSelect through its theme
		const onSel = vi.fn();
		const initial = [ZETA, APPLE];
		renderUi(<Host initial={initial} selectedSort={byLabel} onSel={onSel} />);
		await flush();
		expect(initial.map((entry) => entry.value)).toEqual(["zeta", "apple"]);
		await open();
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		await flush();
		fireEvent.click(removeButton("Banana"));
		await flush();
		// add, then remove: back to the stored order, so a form compares clean
		expect(values(onSel)).toEqual([
			["zeta", "apple", "banana"],
			["zeta", "apple"],
		]);
	});

	it("[ISSUE-3488-ITEM-2] renders a frozen selected array with selectedSort", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() =>
			renderUi(
				<MultiSelect
					selected={Object.freeze([ZETA, APPLE]) as MultiSelectorData[]}
					onSelect={() => {}}
					onLoad={loadFruits}
					selectedSort={byLabel}
				/>,
			),
		).not.toThrow();
	});

	it("[ISSUE-3488-ITEM-2] lists the entries in selectedSort order, also after a pick and when selectedSort changes", async () => {
		const initial = [ZETA, CHERRY, APPLE];
		const ui = (
			selectedSort?: MultiSelectProps<MultiSelectorData>["selectedSort"],
		) => <Host initial={initial} selectedSort={selectedSort} />;
		const { rerender } = renderUi(ui(byLabel));
		await flush();
		expect(entryLabels()).toEqual(["Apple", "Cherry", "Zeta"]);
		await open();
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		await flush();
		expect(entryLabels()).toEqual(["Apple", "Banana", "Cherry", "Zeta"]);
		// a new comparison function takes effect, and without one the caller's order shows
		rerenderUi(
			rerender,
			ui((a, b) => byLabel(b, a)),
		);
		expect(entryLabels()).toEqual(["Zeta", "Cherry", "Banana", "Apple"]);
		rerenderUi(rerender, ui(undefined));
		expect(entryLabels()).toEqual(["Zeta", "Cherry", "Apple", "Banana"]);
	});
});
