import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import {
	SingleSelect,
	MultiSelect,
	MultiSelectWithTags,
	MultiSelectWithoutGroup,
	selectorLocalLoadHandler,
	BaseSelectorData,
} from "./index";
import type { MultiSelectorData } from "./MultiSelect";

// ---------------------------------------------------------------------------
// Shared sample data
// ---------------------------------------------------------------------------

const COUNTRIES: BaseSelectorData[] = [
	{ value: "de", label: "Germany" },
	{ value: "fr", label: "France" },
	{ value: "gb", label: "United Kingdom" },
	{ value: "us", label: "United States" },
	{ value: "jp", label: "Japan" },
	{ value: "au", label: "Australia" },
	{ value: "ca", label: "Canada" },
	{ value: "br", label: "Brazil" },
];

const FRUITS: MultiSelectorData[] = [
	{ value: "apple", label: "Apple", group: "Pome" },
	{ value: "pear", label: "Pear", group: "Pome" },
	{ value: "banana", label: "Banana", group: "Tropical" },
	{ value: "mango", label: "Mango", group: "Tropical" },
	{ value: "strawberry", label: "Strawberry", group: "Berry" },
	{ value: "blueberry", label: "Blueberry", group: "Berry" },
	{ value: "cherry", label: "Cherry", group: "Drupe" },
];

const CATEGORIES: BaseSelectorData[] = [
	{ value: "pome", label: "Pome fruits" },
	{ value: "tropical", label: "Tropical fruits" },
	{ value: "berry", label: "Berries" },
	{ value: "drupe", label: "Drupes" },
];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
const meta: Meta = {
	title: "standalone/Selector",
	parameters: { layout: "centered" },
};
export default meta;

// ---------------------------------------------------------------------------
// SingleSelect stories
// ---------------------------------------------------------------------------

export const SingleSelectBasic: StoryObj = {
	name: "SingleSelect — basic",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(null);
		const onLoad = selectorLocalLoadHandler(COUNTRIES);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={onLoad}
				/>
			</div>
		);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		// Click the input to open the dropdown
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		// Type to filter
		await userEvent.type(input, "Ger");
		// Germany should appear in the options (dropdown renders in a portal)
		const option = await body.findByText("Germany");
		await expect(option).toBeVisible();
		// Select it
		await userEvent.click(option);
		// Input should now show Germany
		await expect(input).toHaveValue("Germany");
	},
};

export const SingleSelectWithValue: StoryObj = {
	name: "SingleSelect — pre-selected value",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(
			COUNTRIES.find((c) => c.value === "de") ?? null,
		);
		const onLoad = selectorLocalLoadHandler(COUNTRIES);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={onLoad}
				/>
			</div>
		);
	},
};

export const SingleSelectDisabled: StoryObj = {
	name: "SingleSelect — disabled",
	render: () => {
		const selected = COUNTRIES.find((c) => c.value === "fr") ?? null;
		const onLoad = selectorLocalLoadHandler(COUNTRIES);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country (disabled)"
					selected={selected}
					onSelect={() => {}}
					onLoad={onLoad}
					disabled
				/>
			</div>
		);
	},
};

export const SingleSelectGrouped: StoryObj = {
	name: "SingleSelect — grouped",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData | null>(null);
		const onLoad = selectorLocalLoadHandler(FRUITS);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect<MultiSelectorData>
					label="Fruit"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={onLoad}
					grouped
					noGroupLabel="Other"
				/>
			</div>
		);
	},
};

// ---------------------------------------------------------------------------
// MultiSelect stories
// ---------------------------------------------------------------------------

export const MultiSelectBasic: StoryObj = {
	name: "MultiSelect — basic",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([]);
		const onLoad = selectorLocalLoadHandler(FRUITS);
		return (
			<div style={{ width: 350 }}>
				<MultiSelect<MultiSelectorData>
					label="Fruits"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={onLoad}
				/>
			</div>
		);
	},
};

export const MultiSelectWithInitialValues: StoryObj = {
	name: "MultiSelect — pre-selected values",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([
			FRUITS.find((f) => f.value === "apple"),
			FRUITS.find((f) => f.value === "banana"),
		]);
		const onLoad = selectorLocalLoadHandler(FRUITS);
		return (
			<div style={{ width: 350 }}>
				<MultiSelect<MultiSelectorData>
					label="Fruits"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={onLoad}
				/>
			</div>
		);
	},
};

export const MultiSelectDisabled: StoryObj = {
	name: "MultiSelect — disabled",
	render: () => {
		const selected: MultiSelectorData[] = [
			FRUITS.find((f) => f.value === "cherry"),
		];
		const onLoad = selectorLocalLoadHandler(FRUITS);
		return (
			<div style={{ width: 350 }}>
				<MultiSelect<MultiSelectorData>
					label="Fruits (disabled)"
					selected={selected}
					onSelect={() => {}}
					onLoad={onLoad}
					disabled
				/>
			</div>
		);
	},
};

// ---------------------------------------------------------------------------
// MultiSelectWithoutGroup stories
// ---------------------------------------------------------------------------

export const MultiSelectWithoutGroupBasic: StoryObj = {
	name: "MultiSelectWithoutGroup — basic",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([]);
		const loadDataOptions = selectorLocalLoadHandler(FRUITS);
		return (
			<div style={{ width: 350 }}>
				<MultiSelectWithoutGroup<MultiSelectorData>
					label="Search fruits"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					loadDataOptions={loadDataOptions}
				/>
			</div>
		);
	},
};

export const MultiSelectWithoutGroupWithValues: StoryObj = {
	name: "MultiSelectWithoutGroup — with values",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([
			FRUITS.find((f) => f.value === "strawberry"),
			FRUITS.find((f) => f.value === "blueberry"),
		]);
		const loadDataOptions = selectorLocalLoadHandler(FRUITS);
		return (
			<div style={{ width: 350 }}>
				<MultiSelectWithoutGroup<MultiSelectorData>
					label="Search fruits"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					loadDataOptions={loadDataOptions}
				/>
			</div>
		);
	},
};

// ---------------------------------------------------------------------------
// MultiSelectWithTags stories
// ---------------------------------------------------------------------------

export const MultiSelectWithTagsBasic: StoryObj = {
	name: "MultiSelectWithTags — basic",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([]);

		const loadGroupOptions = selectorLocalLoadHandler(CATEGORIES);
		const loadDataOptions = selectorLocalLoadHandler(FRUITS);

		const loadGroupEntries = (group: BaseSelectorData): MultiSelectorData[] => {
			const groupMap: Record<string, string> = {
				pome: "Pome",
				tropical: "Tropical",
				berry: "Berry",
				drupe: "Drupe",
			};
			return FRUITS.filter((f) => f.group === groupMap[group.value]);
		};

		return (
			<div style={{ width: 400 }}>
				<MultiSelectWithTags<MultiSelectorData, BaseSelectorData>
					title="Fruits by category"
					selected={selected}
					onChange={(v) => {
						setSelected(v);
					}}
					loadGroupOptions={loadGroupOptions}
					loadDataOptions={loadDataOptions}
					loadGroupEntries={loadGroupEntries}
					searchInputLabel="Search individual fruits"
				/>
			</div>
		);
	},
};

export const MultiSelectWithTagsWithInitialValues: StoryObj = {
	name: "MultiSelectWithTags — pre-selected values",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([
			FRUITS.find((f) => f.value === "mango"),
			FRUITS.find((f) => f.value === "banana"),
		]);

		const loadGroupOptions = selectorLocalLoadHandler(CATEGORIES);
		const loadDataOptions = selectorLocalLoadHandler(FRUITS);
		const loadGroupEntries = (group: BaseSelectorData): MultiSelectorData[] => {
			const groupMap: Record<string, string> = {
				pome: "Pome",
				tropical: "Tropical",
				berry: "Berry",
				drupe: "Drupe",
			};
			return FRUITS.filter((f) => f.group === groupMap[group.value]);
		};

		return (
			<div style={{ width: 400 }}>
				<MultiSelectWithTags<MultiSelectorData, BaseSelectorData>
					title="Fruits by category"
					selected={selected}
					onChange={(v) => {
						setSelected(v);
					}}
					loadGroupOptions={loadGroupOptions}
					loadDataOptions={loadDataOptions}
					loadGroupEntries={loadGroupEntries}
					searchInputLabel="Search individual fruits"
				/>
			</div>
		);
	},
};
