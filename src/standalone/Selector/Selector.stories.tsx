import React, { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor, within } from "storybook/test";
import {
	BaseSelector,
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
import debouncePromise from "../../utils/debouncePromise";

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

// ids a caller wants kept out of the options, regardless of what is selected
const FILTERED_FRUIT_IDS = ["mango"];

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

export const MultiSelectFilterIds: StoryObj = {
	name: "MultiSelect — filterIds on top of the selection",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([
			FRUITS.find((f) => f.value === "apple"),
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
					filterIds={FILTERED_FRUIT_IDS}
				/>
			</div>
		);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		await expect(await body.findByText("Pear")).toBeVisible();
		// the caller supplied id is hidden...
		await expect(optionTexts()).not.toContain("Mango");
		// ...and so is the already selected entry
		await expect(optionTexts()).not.toContain("Apple");
		await expect(optionTexts()).toHaveLength(FRUITS.length - 2);
		// picking one reloads the options, and both filters still apply
		await userEvent.click(await body.findByText("Pear"));
		await waitFor(() => expect(canvas.getAllByText("Pear")).toHaveLength(1));
		await userEvent.click(canvas.getByRole("button", { name: /open/i }));
		await waitFor(async () => {
			await expect(optionTexts()).toHaveLength(FRUITS.length - 3);
		});
		await expect(optionTexts()).not.toContain("Pear");
		await expect(optionTexts()).not.toContain("Mango");
		await expect(optionTexts()).not.toContain("Apple");
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

export const MultiSelectWithoutGroupFilterIds: StoryObj = {
	name: "MultiSelectWithoutGroup — filterIds on top of the selection",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([
			FRUITS.find((f) => f.value === "apple"),
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
					filterIds={FILTERED_FRUIT_IDS}
				/>
			</div>
		);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		await expect(await body.findByText("Pear")).toBeVisible();
		await expect(optionTexts()).not.toContain("Mango");
		await expect(optionTexts()).not.toContain("Apple");
		await expect(optionTexts()).toHaveLength(FRUITS.length - 2);
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

/**
 * MultiSelectWithTags titles itself with a Typography rather than a MUI FormLabel, so
 * unlike every other selector it renders the dirty marker as an element instead of
 * getting it from the label pseudo element.
 */
export const MultiSelectWithTagsDirty: StoryObj = {
	name: "MultiSelectWithTags — dirty marker",
	render: () => {
		const [selected, setSelected] = useState<MultiSelectorData[]>([]);
		return (
			<div style={{ width: 400 }}>
				<MultiSelectWithTags<MultiSelectorData, BaseSelectorData>
					title="Fruits by category"
					selected={selected}
					onChange={setSelected}
					loadGroupOptions={selectorLocalLoadHandler(CATEGORIES)}
					loadDataOptions={selectorLocalLoadHandler(FRUITS)}
					loadGroupEntries={() => []}
					searchInputLabel="Search individual fruits"
					dirty
				/>
			</div>
		);
	},
	play: async ({ canvas }) => {
		const marker = canvas.getByText("Fruits by category").querySelector("span");
		await expect(marker).not.toBe(null);
		await expect(getComputedStyle(marker).width).toBe("6px");
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

// ---------------------------------------------------------------------------
// lru mode "prepend": recently used on top of the full list
// ---------------------------------------------------------------------------

const LRU_PREPEND_STORAGE_KEY = "cc-story-lru-prepend";
const LRU_PREPEND: SelectorLruOptions<BaseSelectorData> = {
	mode: "prepend",
	count: 3,
	storageKey: LRU_PREPEND_STORAGE_KEY,
	forceQuery: false,
	// unknown ids are skipped (and kept), not shown as raw ids
	loadData: (id) => COUNTRIES.find((entry) => entry.value === id),
};
const loadCountries = selectorLocalLoadHandler(COUNTRIES);

export const SingleSelectLruPrepend: StoryObj = {
	name: "SingleSelect — lru mode prepend",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(null);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country"
					selected={selected}
					onSelect={setSelected}
					onLoad={loadCountries}
					lru={LRU_PREPEND}
				/>
			</div>
		);
	},
	beforeEach: () => {
		// "xx" is unknown to the data set, so loadData skips it
		localStorage.setItem(
			LRU_PREPEND_STORAGE_KEY,
			JSON.stringify(["jp", "xx", "fr"]),
		);
		return () => localStorage.removeItem(LRU_PREPEND_STORAGE_KEY);
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		// empty query: label, the resolved LRU entries, divider, then the rest without repeats
		await waitFor(() =>
			expect(optionTexts()).toEqual([
				"Last recently used",
				"Japan",
				"France",
				"",
				"Germany",
				"United Kingdom",
				"United States",
				"Australia",
				"Canada",
				"Brazil",
			]),
		);
		// a query filters both parts
		await userEvent.type(input, "an");
		await waitFor(() =>
			expect(optionTexts()).toEqual([
				"Last recently used",
				"Japan",
				"France",
				"",
				"Germany",
				"Canada",
			]),
		);
		// selecting moves the entry to the front of the LRU, capped at count; the skipped
		// id keeps its slot
		await userEvent.click(await body.findByText("Canada"));
		await waitFor(() =>
			expect(
				JSON.parse(localStorage.getItem(LRU_PREPEND_STORAGE_KEY) ?? "[]"),
			).toEqual(["ca", "jp", "xx"]),
		);
	},
};

const LRU_SKIPPED_STORAGE_KEY = "cc-story-lru-skipped";
const LRU_SKIPPED: SelectorLruOptions<BaseSelectorData> = {
	count: 3,
	storageKey: LRU_SKIPPED_STORAGE_KEY,
	forceQuery: false,
	loadData: (id) => COUNTRIES.find((entry) => entry.value === id),
};

export const SingleSelectLruNothingResolved: StoryObj = {
	name: "SingleSelect — lru falls back to the list when nothing resolves",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData | null>(null);
		return (
			<div style={{ width: 300 }}>
				<SingleSelect
					label="Country"
					selected={selected}
					onSelect={setSelected}
					onLoad={loadCountries}
					lru={LRU_SKIPPED}
				/>
			</div>
		);
	},
	beforeEach: () => {
		// both ids are unknown to the data set, so loadData skips them
		localStorage.setItem(LRU_SKIPPED_STORAGE_KEY, JSON.stringify(["xx", "yy"]));
		return () => localStorage.removeItem(LRU_SKIPPED_STORAGE_KEY);
	},
	play: async ({ canvas, userEvent }) => {
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		// no bare LRU label: the data source is shown as if there was no LRU
		await waitFor(() =>
			expect(optionTexts()).toEqual(COUNTRIES.map((entry) => entry.label)),
		);
		// the skipped ids stay in the LRU
		await expect(
			JSON.parse(localStorage.getItem(LRU_SKIPPED_STORAGE_KEY) ?? "[]"),
		).toEqual(["xx", "yy"]);
	},
};

// ---------------------------------------------------------------------------
// multi select (BaseSelector multiple) keeps the search query
// ---------------------------------------------------------------------------

export const BaseSelectorMultiple: StoryObj = {
	name: "BaseSelector — multiple keeps the search",
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData[]>([]);
		const onLoad = selectorLocalLoadHandler(FRUITS);
		return (
			<div style={{ width: 350 }}>
				<BaseSelector<BaseSelectorData, true>
					multiple
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
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		await userEvent.type(input, "berry");
		// only the berries match
		await expect(await body.findByText("Strawberry")).toBeVisible();
		await expect(optionTexts()).toEqual(["Strawberry", "Blueberry"]);
		// selecting keeps both the query and the options matching it, so the
		// remaining matches can be picked without searching again
		await userEvent.click(body.getByText("Strawberry"));
		await expect(optionTexts()).toEqual(["Strawberry", "Blueberry"]);
		await expect(input).toHaveValue("Strawberry berry");
		await userEvent.click(body.getByText("Blueberry"));
		await expect(input).toHaveValue("Strawberry, Blueberry berry");
	},
};

// ---------------------------------------------------------------------------
// a slow load must not overwrite the results of a newer search
// ---------------------------------------------------------------------------

interface PendingLoad {
	query: string;
	/** answers the load with the results for its own query */
	release: () => void;
}

/** loads which reached the data source and are waiting to be answered */
const pendingLoads: PendingLoad[] = [];

const deferredLoad = (
	query: string,
): Promise<BaseSelectorLoadResult<BaseSelectorData>> =>
	new Promise((resolve) => {
		pendingLoads.push({
			query,
			release: () => {
				resolve(selectorLocalLoadHandler(FRUITS)(query));
			},
		});
	});

export const BaseSelectorMultipleSlowLoad: StoryObj = {
	name: "BaseSelector — slow load doesn't reset the search",
	beforeEach: () => {
		pendingLoads.length = 0;
	},
	render: () => {
		const [selected, setSelected] = useState<BaseSelectorData[]>([]);
		// same setup the backend selectors use: a debounced, asynchronous data source
		const onLoad = useMemo(() => debouncePromise(deferredLoad, 50), []);
		return (
			<div style={{ width: 350 }}>
				<BaseSelector<BaseSelectorData, true>
					multiple
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
	play: async ({ canvas, userEvent }) => {
		const input = await canvas.findByRole("combobox");
		await userEvent.click(input);
		await userEvent.type(input, "berry");
		// the search reached the data source while the initial load is still running
		await waitFor(() =>
			expect(pendingLoads.some((load) => load.query === "berry")).toBe(true),
		);
		// the initial load answers first, which must not take the search back
		pendingLoads
			.filter((load) => load.query !== "berry")
			.forEach((load) => {
				load.release();
			});
		pendingLoads
			.filter((load) => load.query === "berry")
			.forEach((load) => {
				load.release();
			});
		await waitFor(() =>
			expect(optionTexts()).toEqual(["Strawberry", "Blueberry"]),
		);
	},
};
