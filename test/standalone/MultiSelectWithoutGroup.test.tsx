import React, { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import {
	getStringLabel,
	selectorLocalLoadHandler,
} from "../../src/standalone/Selector/BaseSelector";
import { MultiSelectorData } from "../../src/standalone/Selector/MultiSelect";
import MultiSelectWithoutGroup, {
	MultiSelectWithoutGroupProps,
} from "../../src/standalone/Selector/MultiSelectWithoutGroup";
import ccI18n from "../../src/i18n";

// jsdom has "ontouchstart" on window, so TextFieldWithHelp would add its touch
// Clear button next to Autocomplete's own one
vi.mock("../../src/utils/isTouchDevice", () => ({ default: () => false }));

beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	localStorage.clear();
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
const [APPLE, , , ZETA] = FRUITS;
const loadFruits = selectorLocalLoadHandler(FRUITS);

const values = (spy: { mock: { calls: unknown[][] } }) =>
	spy.mock.calls.map((call) =>
		(call[0] as MultiSelectorData[]).map((entry) => entry.value),
	);

const renderUi = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

const combobox = () => screen.getByRole<HTMLInputElement>("combobox");
const open = async (input: HTMLElement = combobox()) => {
	act(() => input.focus());
	fireEvent.mouseDown(input);
	await flush();
};
const removeButton = (label: string) =>
	screen.getByRole("button", { name: `Remove ${label}` });
/** the labels of the chips, in the order they are shown */
const chipLabels = () =>
	screen
		.getAllByRole("button", { name: /^Remove / })
		.map((button) =>
			(button.getAttribute("aria-label") ?? "").replace(/^Remove /, ""),
		);
const byLabel = (a: MultiSelectorData, b: MultiSelectorData) =>
	getStringLabel(a).localeCompare(getStringLabel(b));

type HostProps = Partial<
	Omit<MultiSelectWithoutGroupProps<MultiSelectorData>, "selected" | "onSelect">
> & {
	initial?: MultiSelectorData[];
	onSel?: (value: MultiSelectorData[]) => void;
};

/** a controlled MultiSelectWithoutGroup, labelled "Search fruits", over FRUITS */
const Host = ({ initial = [], onSel, ...other }: HostProps) => {
	const [selected, setSelected] = useState<MultiSelectorData[]>(initial);
	return (
		<MultiSelectWithoutGroup
			label="Search fruits"
			loadDataOptions={loadFruits}
			{...other}
			selected={selected}
			onSelect={(value) => {
				onSel?.(value);
				setSelected(value);
			}}
		/>
	);
};

describe("MultiSelectWithoutGroup bugs", () => {
	it("[ISSUE-3488-ITEM-2] does not reorder the caller's selected array when sortCompareFn is set", async () => {
		const initial = [ZETA, APPLE];
		renderUi(
			<Host
				initial={initial}
				sortCompareFn={(a, b) =>
					getStringLabel(a).localeCompare(getStringLabel(b))
				}
			/>,
		);
		await flush();
		expect(initial.map((entry) => entry.value)).toEqual(["zeta", "apple"]);
	});

	it("[ISSUE-3488-ITEM-2] shows the chips in sortCompareFn order, and onSelect keeps the caller's order", async () => {
		const onSel = vi.fn();
		renderUi(
			<Host initial={[ZETA, APPLE]} sortCompareFn={byLabel} onSel={onSel} />,
		);
		await flush();
		expect(chipLabels()).toEqual(["Apple", "Zeta"]);
		await open();
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		await flush();
		expect(chipLabels()).toEqual(["Apple", "Banana", "Zeta"]);
		fireEvent.click(removeButton("Banana"));
		await flush();
		expect(values(onSel)).toEqual([
			["zeta", "apple", "banana"],
			["zeta", "apple"],
		]);
	});

	it("[ISSUE-3488-ITEM-2] renders a frozen selected array with sortCompareFn", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() =>
			renderUi(
				<MultiSelectWithoutGroup
					selected={Object.freeze([ZETA, APPLE]) as MultiSelectorData[]}
					onSelect={() => {}}
					loadDataOptions={loadFruits}
					sortCompareFn={byLabel}
				/>,
			),
		).not.toThrow();
	});
});
