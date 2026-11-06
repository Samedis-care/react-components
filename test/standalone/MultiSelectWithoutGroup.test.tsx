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
const switchInput = (container: HTMLElement) =>
	container.querySelector<HTMLInputElement>("input[type=checkbox]");
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

	it("[ISSUE-3488-ITEM-6] disables the search field while disabled", async () => {
		const onSel = vi.fn();
		renderUi(<Host initial={[APPLE]} disabled onSel={onSel} />);
		await flush();
		expect(combobox()).toBeDisabled();
	});

	it("[ISSUE-3488-ITEM-6] disables the switch while disabled", async () => {
		const setSwitchValue = vi.fn();
		const { container } = renderUi(
			<Host
				initial={[APPLE]}
				disabled
				displaySwitch
				switchLabel="Show inactive"
				switchValue={false}
				setSwitchValue={setSwitchValue}
			/>,
		);
		await flush();
		const checkbox = switchInput(container);
		if (!checkbox) throw new Error("no switch");
		fireEvent.click(checkbox);
		expect(setSwitchValue).not.toHaveBeenCalled();
	});

	it("[ISSUE-3488-ITEM-6] disables the switch input, also for clicks on its label, and enables the search field and the switch again when disabled is turned off", async () => {
		const setSwitchValue = vi.fn();
		const ui = (disabled: boolean) => (
			<ThemeProvider theme={createTheme()}>
				<MultiSelectWithoutGroup
					label="Search fruits"
					selected={[APPLE]}
					onSelect={() => {}}
					loadDataOptions={loadFruits}
					disabled={disabled}
					displaySwitch
					switchLabel="Show inactive"
					switchValue={false}
					setSwitchValue={setSwitchValue}
				/>
			</ThemeProvider>
		);
		const { rerender } = render(ui(true));
		await flush();
		const sw = screen.getByRole("switch", { name: "Show inactive" });
		expect(sw).toBeDisabled();
		fireEvent.click(screen.getByText("Show inactive"));
		expect(setSwitchValue).not.toHaveBeenCalled();
		rerender(ui(false));
		await flush();
		expect(combobox()).not.toBeDisabled();
		expect(
			screen.getByRole("switch", { name: "Show inactive" }),
		).not.toBeDisabled();
		fireEvent.click(screen.getByText("Show inactive"));
		expect(setSwitchValue).toHaveBeenCalledWith(true);
	});
});
