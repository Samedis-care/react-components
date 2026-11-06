import React, { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import {
	BaseSelectorData,
	getStringLabel,
	selectorLocalLoadHandler,
} from "../../src/standalone/Selector/BaseSelector";
import { MultiSelectorData } from "../../src/standalone/Selector/MultiSelect";
import MultiSelectWithTags, {
	MultiSelectWithTagsProps,
} from "../../src/standalone/Selector/MultiSelectWithTags";
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
});

/** lets the option loads and async handlers started by the last event settle */
const flush = async () => {
	for (let i = 0; i < 10; i++) await act(() => Promise.resolve());
};

const deferred = <T,>() => {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

const FRUITS: MultiSelectorData[] = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
	{ value: "zeta", label: "Zeta" },
];
const [APPLE, BANANA, CHERRY] = FRUITS;

const loadFruits = selectorLocalLoadHandler(FRUITS);

const GROUPS: BaseSelectorData[] = [
	{ value: "g-red", label: "Red fruits" },
	{ value: "g-yellow", label: "Yellow fruits" },
];

const groupEntries = (group: BaseSelectorData) =>
	group.value === "g-red" ? [APPLE, CHERRY] : [BANANA];

const values = (spy: { mock: { calls: unknown[][] } }) =>
	spy.mock.calls.map((call) =>
		(call[0] as MultiSelectorData[]).map((entry) => entry.value),
	);

const renderUi = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

const groupField = () => screen.getAllByRole<HTMLInputElement>("combobox")[0];

const dataField = () => screen.getAllByRole<HTMLInputElement>("combobox")[1];

const open = async (input: HTMLElement) => {
	act(() => input.focus());
	fireEvent.mouseDown(input);
	await flush();
};

const pickGroup = async (label: string) => {
	await open(groupField());
	fireEvent.click(screen.getByRole("option", { name: label }));
	await flush();
};

type HostProps = Partial<
	Omit<
		MultiSelectWithTagsProps<MultiSelectorData, BaseSelectorData>,
		"selected" | "onChange"
	>
> & {
	initial?: MultiSelectorData[];
	onChg?: (value: MultiSelectorData[]) => void;
	/** false: the parent ignores the change */
	apply?: boolean;
};

/** a controlled MultiSelectWithTags titled "Fruits" over GROUPS and FRUITS */
const Host = ({ initial = [], onChg, apply = true, ...other }: HostProps) => {
	const [selected, setSelected] = useState<MultiSelectorData[]>(initial);
	return (
		<MultiSelectWithTags<MultiSelectorData, BaseSelectorData>
			title="Fruits"
			searchInputLabel="Search fruits"
			loadGroupEntries={groupEntries}
			loadGroupOptions={selectorLocalLoadHandler(GROUPS)}
			loadDataOptions={loadFruits}
			{...other}
			selected={selected}
			onChange={(value) => {
				onChg?.(value);
				if (apply) setSelected(value);
			}}
		/>
	);
};

describe("MultiSelectWithTags bugs", () => {
	it("[ISSUE-3488-ITEM-2] a group pick keeps the caller's order when sortCompareFn is set", async () => {
		const onChg = vi.fn();
		const initial = [CHERRY, BANANA];
		renderUi(
			<Host
				initial={initial}
				sortCompareFn={(a, b) =>
					getStringLabel(a).localeCompare(getStringLabel(b))
				}
				onChg={onChg}
			/>,
		);
		await flush();
		expect(initial.map((entry) => entry.value)).toEqual(["cherry", "banana"]);
		await pickGroup("Red fruits");
		expect(values(onChg)).toEqual([["cherry", "banana", "apple"]]);
	});
	it("[ISSUE-3488-ITEM-26] groups both fields under the title and names the group field", async () => {
		renderUi(<Host />);
		await flush();
		const group = screen.getByRole("group", { name: "Fruits" });
		expect(within(group).getAllByRole("combobox")).toHaveLength(2);
		expect(groupField()).toHaveAccessibleName();
	});
	it("[ISSUE-3488-ITEM-26] names the group field with a translated default, or with groupInputLabel, and its listbox likewise", async () => {
		renderUi(<Host dirty />);
		await flush();
		// the dirty marker does not change the group's name
		expect(screen.getByRole("group", { name: "Fruits" })).toBeInTheDocument();
		expect(groupField()).toHaveAccessibleName("Add all entries of a group");
		cleanup();
		renderUi(<Host groupInputLabel="Add a fruit family" />);
		await flush();
		expect(groupField()).toHaveAccessibleName("Add a fruit family");
		await open(groupField());
		expect(screen.getByRole("listbox")).toHaveAccessibleName(
			"Add a fruit family",
		);
	});
	it("[ISSUE-3488-ITEM-26] names the fields of each of two controls on a page after their own title", async () => {
		renderUi(
			<>
				<Host title="Fruits" groupInputLabel="Add a fruit family" />
				<Host title="Vegetables" groupInputLabel="Add a vegetable family" />
			</>,
		);
		await flush();
		const fruits = screen.getByRole("group", { name: "Fruits" });
		const vegetables = screen.getByRole("group", { name: "Vegetables" });
		expect(within(fruits).getAllByRole("combobox")[0]).toHaveAccessibleName(
			"Add a fruit family",
		);
		expect(within(vegetables).getAllByRole("combobox")[0]).toHaveAccessibleName(
			"Add a vegetable family",
		);
	});
	it("[ISSUE-3488-ITEM-6] disables the data field while disabled", async () => {
		renderUi(<Host initial={[APPLE]} disabled />);
		await flush();
		expect(groupField()).toBeDisabled();
		expect(dataField()).toBeDisabled();
	});
	it("[ISSUE-3488-ITEM-27] marks the control busy while a group loads", async () => {
		const gate = deferred<MultiSelectorData[]>();
		const { container } = renderUi(
			<Host loadGroupEntries={() => gate.promise} />,
		);
		await flush();
		await pickGroup("Red fruits");
		expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
		act(() => {
			gate.resolve([APPLE]);
		});
		await flush();
	});
	it("[ISSUE-3488-ITEM-27] keeps the group field focusable but read-only while a group loads", async () => {
		const gate = deferred<MultiSelectorData[]>();
		const { container } = renderUi(
			<Host loadGroupEntries={() => gate.promise} />,
		);
		await flush();
		await pickGroup("Red fruits");
		expect(groupField()).toBeEnabled();
		expect(groupField()).toHaveAttribute("readonly");
		// no key opens the list while the entries load
		fireEvent.keyDown(groupField(), { key: "ArrowDown" });
		await flush();
		expect(screen.queryByRole("listbox")).toBeNull();
		act(() => {
			gate.resolve([APPLE, CHERRY]);
		});
		await flush();
		expect(container.firstElementChild).toHaveAttribute("aria-busy", "false");
		expect(groupField()).not.toHaveAttribute("readonly");
		fireEvent.keyDown(groupField(), { key: "ArrowDown" });
		await flush();
		expect(
			within(screen.getByRole("listbox"))
				.getAllByRole("option")
				.map((option) => option.textContent),
		).toEqual(["Yellow fruits"]);
	});
	it("[ISSUE-3488-ITEM-27] gives focus back to the group field after a pick, but not after a touch", async () => {
		renderUi(<Host />);
		await flush();
		await open(groupField());
		const red = screen.getByRole("option", { name: "Red fruits" });
		fireEvent.pointerDown(red, { pointerType: "mouse" });
		fireEvent.click(red);
		await flush();
		expect(screen.getByRole("button", { name: "Remove Cherry" })).toBeVisible();
		expect(groupField()).toHaveFocus();
		await open(groupField());
		const yellow = screen.getByRole("option", { name: "Yellow fruits" });
		// a touch pick blurs the field to close the on-screen keyboard
		fireEvent.touchStart(yellow);
		fireEvent.pointerDown(yellow, { pointerType: "touch" });
		fireEvent.click(yellow);
		await flush();
		expect(screen.getByRole("button", { name: "Remove Banana" })).toBeVisible();
		expect(groupField()).not.toHaveFocus();
	});
	it("[ISSUE-3488-ITEM-27] leaves focus where the user moved it during the load", async () => {
		const gate = deferred<MultiSelectorData[]>();
		renderUi(
			<>
				<Host loadGroupEntries={() => gate.promise} />
				<button type="button">after</button>
			</>,
		);
		await flush();
		await pickGroup("Red fruits");
		expect(groupField()).toHaveFocus();
		const after = screen.getByRole("button", { name: "after" });
		act(() => after.focus());
		act(() => {
			gate.resolve([APPLE]);
		});
		await flush();
		expect(after).toHaveFocus();
	});
	it("[ISSUE-3488-ITEM-27] takes focus back only until the picked group has loaded", async () => {
		const { rerender } = renderUi(<Host />);
		await flush();
		await pickGroup("Red fruits");
		expect(groupField()).toHaveFocus();
		act(() => groupField().blur());
		rerender(
			<ThemeProvider theme={createTheme()}>
				<Host title="Fruit" />
			</ThemeProvider>,
		);
		await flush();
		expect(document.body).toHaveFocus();
	});
});
