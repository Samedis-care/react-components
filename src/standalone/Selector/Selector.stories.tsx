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
	BaseSelectorLoadResult,
	SelectorLruOptions,
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

// ---------------------------------------------------------------------------
// Truncated result sets
// ---------------------------------------------------------------------------

const TRUNCATED_TOTAL = 312;
const CUSTOM_TRUNCATED_LABEL = "Too many matches";
const ADD_NEW_LABEL = "Add a country";

const loadTruncated = (
	search: string,
): BaseSelectorLoadResult<BaseSelectorData> => ({
	...selectorLocalLoadHandler(COUNTRIES)(search),
	total: TRUNCATED_TOTAL,
});

const loadComplete = (
	search: string,
): BaseSelectorLoadResult<BaseSelectorData> => {
	const { options } = selectorLocalLoadHandler(COUNTRIES)(search);
	return { options, total: options.length };
};

const optionTexts = () =>
	within(document.body)
		.getAllByRole("option")
		.map((option) => option.textContent ?? "");

export const SingleSelectTruncated: StoryObj = {
	name: "SingleSelect — truncated result set",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(null);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={loadTruncated}
				/>
			</div>
		);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		// options are rendered...
		await expect(await body.findByText("Germany")).toBeVisible();
		// ...and the last entry of the list tells the user the set is incomplete
		const texts = optionTexts();
		await expect(texts).toHaveLength(COUNTRIES.length + 1);
		await expect(texts[texts.length - 1]).toContain(String(TRUNCATED_TOTAL));
	},
};

export const SingleSelectComplete: StoryObj = {
	name: "SingleSelect — complete result set (no notice)",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(null);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={loadComplete}
				/>
			</div>
		);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		await expect(await body.findByText("Germany")).toBeVisible();
		// nothing was truncated, so no extra entry is added
		await expect(optionTexts()).toHaveLength(COUNTRIES.length);
	},
};

export const SingleSelectTruncatedWithAddNew: StoryObj = {
	name: "SingleSelect — truncation entry sits above add new",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(null);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect<BaseSelectorData>
					label="Country"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={loadTruncated}
					truncatedLabel={() => CUSTOM_TRUNCATED_LABEL}
					addNewLabel={ADD_NEW_LABEL}
					onAddNew={() => null}
				/>
			</div>
		);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		await expect(await body.findByText("Germany")).toBeVisible();
		const texts = optionTexts();
		// truncatedLabel overrides the translated default
		const truncationIdx = texts.indexOf(CUSTOM_TRUNCATED_LABEL);
		const addNewIdx = texts.indexOf(ADD_NEW_LABEL);
		await expect(truncationIdx).toBeGreaterThan(-1);
		await expect(addNewIdx).toBeGreaterThan(-1);
		// after the options...
		await expect(truncationIdx).toBe(COUNTRIES.length);
		// ...and before the add new button
		await expect(addNewIdx).toBeGreaterThan(truncationIdx);
	},
};

// ---------------------------------------------------------------------------
// additionalOptions are independent of the data source
// ---------------------------------------------------------------------------

const ADDITIONAL_OPTIONS: BaseSelectorData[] = [
	{ value: "any", label: "Any country" },
	{ value: "none", label: "No country" },
];
const ADDITIONAL_LABELS = ["Any country", "No country"];

const LRU_FORCE_QUERY: SelectorLruOptions<BaseSelectorData> = {
	count: 5,
	storageKey: "cc-story-lru-additional-options",
	forceQuery: true,
	loadData: (id) =>
		COUNTRIES.find((entry) => entry.value === id) ?? { value: id, label: id },
};

export const SingleSelectForceQueryAdditionalOptions: StoryObj = {
	name: "SingleSelect — additionalOptions survive forceQuery",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(null);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={loadTruncated}
					forceQuery
					additionalOptions={ADDITIONAL_OPTIONS}
				/>
			</div>
		);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		// the data source stays suppressed until something is typed...
		await expect(body.queryByText("Germany")).toBeNull();
		// ...but the local entries need no request, so they are offered
		await expect(optionTexts()).toEqual(ADDITIONAL_LABELS);
	},
};

export const SingleSelectLruAdditionalOptions: StoryObj = {
	name: "SingleSelect — additionalOptions survive lru",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(null);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country"
					selected={selected}
					onSelect={(v) => {
						setSelected(v);
					}}
					onLoad={loadTruncated}
					additionalOptions={ADDITIONAL_OPTIONS}
					lru={LRU_FORCE_QUERY}
				/>
			</div>
		);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		// the lru branch also skips onLoad, yet the local entries survive it
		await expect(body.queryByText("Germany")).toBeNull();
		await expect(optionTexts()).toEqual(ADDITIONAL_LABELS);
	},
};
