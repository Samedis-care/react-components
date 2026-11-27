/**
 * BackendSingleSelect over a model of people (backendSelectorFixture): which record the
 * field shows for `selected`, and the search request.
 */
// first: BackendSingleSelect cannot be the first components-care module imported (import cycle)
import "../../../src/standalone";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import BackendSingleSelect, {
	BackendSingleSelectProps,
} from "../../../src/backend-components/Selector/BackendSingleSelect";
import { Model, type ModelUnknown } from "../../../src/backend-integration";
import type { BaseSelectorData } from "../../../src/standalone";
import { PartialExcept } from "../../../src/utils/distributiveOmit";
import { setupFormTests } from "../Form/formFixture";
import {
	combobox,
	conv,
	flush,
	makeSelectorModel,
	openList,
	people,
	peopleModel,
	pickOption,
	type Row,
	SelectorTestConnector,
	typeText,
} from "./backendSelectorFixture";

setupFormTests();

type Props = PartialExcept<
	BackendSingleSelectProps<ModelUnknown>,
	"switchFilterName" | "switchLabel" | "defaultSwitchValue"
> & {
	model: ModelUnknown;
};

const field = (props: Props) => (
	<BackendSingleSelect
		modelToSelectorData={conv}
		label={"Person"}
		searchDebounceTime={0}
		selected={null}
		{...props}
	/>
);

const ui = (props: Props) => <Framework>{field(props)}</Framework>;

/** a parent that applies every onSelect to selected */
const Parent = ({
	initial = null,
	onSelect,
	...props
}: Props & { initial?: string | null }) => {
	const [selected, setSelected] = useState<string | null>(initial);
	return field({
		...props,
		selected,
		onSelect: (value) => {
			onSelect?.(value);
			setSelected(value);
		},
	});
};

const lookups = (connector: SelectorTestConnector) =>
	connector.log.filter(
		(entry) => entry.startsWith("read:") || entry.includes(":ids="),
	);

/**
 * Records the titles the input gets from now on (its title is the shown entry's label);
 * the returned function stops recording and lists every title committed in between, in
 * order, from the one it had at the start to the current one
 */
const watchTitles = (input: HTMLInputElement = combobox()) => {
	const records: MutationRecord[] = [];
	const observer = new MutationObserver((list) => records.push(...list));
	observer.observe(input, {
		attributeFilter: ["title"],
		attributeOldValue: true,
	});
	return () => {
		records.push(...observer.takeRecords());
		observer.disconnect();
		return [
			...records.map((record) => record.oldValue),
			input.getAttribute("title"),
		];
	};
};

// ---------------------------------------------------------------------------
// Bugs (each test asserts the correct behavior and fails until it is fixed)
// ---------------------------------------------------------------------------

describe("BackendSingleSelect bugs", () => {
	it("[ISSUE-3510-ITEM-1] after an outside change the field shows the placeholder, not the previous record, while the new one loads", async () => {
		const { model, connector } = peopleModel();
		const { rerender } = render(
			ui({ model, selected: "2", disableRequestBatching: true }),
		);
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		const release = connector.hold("3");
		rerender(ui({ model, selected: "3", disableRequestBatching: true }));
		await flush();
		expect(combobox().value).toBe("Loading…");
		await release();
		expect(combobox().value).toBe("Carol");
	});

	it("[ISSUE-3510-ITEM-1] a lookup that finishes after selected moved on is discarded", async () => {
		const { model, connector } = peopleModel();
		const release = connector.hold("1");
		const { rerender } = render(
			ui({ model, selected: "1", disableRequestBatching: true }),
		);
		await flush();
		rerender(ui({ model, selected: "2", disableRequestBatching: true }));
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		await release();
		expect(combobox().value).toBe("Bob");
	});

	it("[ISSUE-3510-ITEM-1] a lookup that fails after selected moved on is discarded: no onLoadError, no onSelect(null)", async () => {
		const { model, connector } = peopleModel();
		connector.fail["1"] = new Error("gone");
		const release = connector.hold("1");
		const onLoadError = vi.fn(() => null);
		const onSelect = vi.fn();
		const props = {
			model,
			onLoadError,
			onSelect,
			disableRequestBatching: true,
		};
		const { rerender } = render(ui({ ...props, selected: "1" }));
		await flush();
		rerender(ui({ ...props, selected: "2" }));
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		await release();
		expect(onLoadError).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		expect(combobox().value).toBe("Bob");
	});

	it("[ISSUE-3510-ITEM-1] a pick is shown at once, without 'Loading…' while the parent applies it", async () => {
		const { model } = peopleModel();
		render(
			<Framework>
				<Parent model={model} initial={"1"} disableRequestBatching />
			</Framework>,
		);
		await waitFor(() => expect(combobox().value).toBe("Alice"));
		await openList();
		const titles = watchTitles();
		await pickOption("Bob");
		expect(combobox().value).toBe("Bob");
		expect(titles()).toEqual(["Alice", "Bob"]);
	});

	it("[ISSUE-3510-ITEM-1] an outside change to an additionalOptions id shows that entry at once, without 'Loading…'", async () => {
		const { model } = peopleModel();
		const props = {
			model,
			disableRequestBatching: true,
			additionalOptions: [{ value: "none", label: "No one" }],
		};
		const { rerender } = render(ui({ ...props, selected: "2" }));
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		const titles = watchTitles();
		rerender(ui({ ...props, selected: "none" }));
		await flush();
		expect(combobox().value).toBe("No one");
		expect(titles()).toEqual(["Bob", "No one"]);
	});

	it("[ISSUE-3510-ITEM-2] a record dropped by onLoadError does not undo a pick made while it loaded", async () => {
		const { model, connector } = peopleModel();
		connector.fail["1"] = new Error("gone");
		const release = connector.hold("1");
		const onSelect = vi.fn();
		render(
			<Framework>
				<Parent
					model={model}
					initial={"1"}
					onSelect={onSelect}
					onLoadError={() => null}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		await openList();
		await pickOption("Bob");
		expect(combobox().value).toBe("Bob");
		await release();
		expect(onSelect.mock.calls).toEqual([["2"]]);
		expect(combobox().value).toBe("Bob");
	});

	it("[ISSUE-3510-ITEM-2] a record dropped after the field unmounted is not reported", async () => {
		const { model, connector } = peopleModel();
		connector.fail["1"] = new Error("gone");
		const release = connector.hold("1");
		const onSelect = vi.fn();
		const { unmount } = render(
			ui({
				model,
				selected: "1",
				onSelect,
				onLoadError: () => null,
				disableRequestBatching: true,
			}),
		);
		await flush();
		unmount();
		await release();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("[ISSUE-3510-ITEM-3] a pick from the list does not look the picked record up again", async () => {
		const { model, connector } = peopleModel();
		render(
			<Framework>
				<Parent model={model} disableRequestBatching />
			</Framework>,
		);
		await flush();
		await openList();
		await pickOption("Bob");
		await flush();
		expect(combobox().value).toBe("Bob");
		expect(lookups(connector)).toEqual([]);
	});

	it("[ISSUE-3510-ITEM-3] a failing lookup of the picked record does not undo the pick", async () => {
		const { model, connector } = peopleModel();
		connector.fail["2"] = new Error("403 Forbidden");
		const onSelect = vi.fn();
		render(
			<Framework>
				<Parent
					model={model}
					onSelect={onSelect}
					onLoadError={() => null}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		await openList();
		await pickOption("Bob");
		await flush();
		expect(onSelect.mock.calls).toEqual([["2"]]);
		expect(combobox().value).toBe("Bob");
	});

	it("[ISSUE-3510-ITEM-3] the entry onAddNew returns is shown as picked, without a lookup", async () => {
		const { model, connector } = peopleModel();
		const onSelect = vi.fn();
		render(
			<Framework>
				<Parent
					model={model}
					onSelect={onSelect}
					onAddNew={() => ({ value: "9", label: "Zoe" })}
					onLoadError={() => null}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		await openList();
		await pickOption("Create");
		await flush();
		expect(onSelect.mock.calls).toEqual([["9"]]);
		expect(combobox().value).toBe("Zoe");
		expect(lookups(connector)).toEqual([]);
	});

	it("[ISSUE-3510-ITEM-5] a record that cannot be loaded and has no onLoadError shows the translated error text, not the developer message", async () => {
		const { model } = peopleModel();
		render(ui({ model, selected: "9" }));
		await waitFor(() => expect(combobox().value).not.toBe("Loading…"));
		expect(combobox().value).not.toMatch(/\[Components-Care\]/);
		expect(combobox().value).toBe("Unknown entry");
	});

	it("[ISSUE-3510-ITEM-5] a record that cannot be loaded marks the field invalid", async () => {
		const { model, connector } = peopleModel();
		render(ui({ model, selected: "9", disableRequestBatching: true }));
		await flush();
		expect(connector.log).toContain("read:9");
		expect(combobox().value).not.toBe("Loading…");
		expect(combobox()).toHaveAttribute("aria-invalid", "true");
	});

	it("[ISSUE-3510-ITEM-5] a record labelled by onLoadError marks the field invalid too", async () => {
		const { model } = peopleModel();
		render(ui({ model, selected: "9", onLoadError: () => "Access denied" }));
		await waitFor(() => expect(combobox().value).toBe("Access denied"));
		expect(combobox()).toHaveAttribute("aria-invalid", "true");
	});

	it("[ISSUE-3510-ITEM-5] picking a record ends the error state of one that could not be loaded", async () => {
		const { model } = peopleModel();
		render(
			<Framework>
				<Parent model={model} initial={"9"} />
			</Framework>,
		);
		await waitFor(() => expect(combobox().value).toBe("Unknown entry"));
		expect(combobox()).toHaveAttribute("aria-invalid", "true");
		await openList();
		await pickOption("Bob");
		expect(combobox().value).toBe("Bob");
		expect(combobox()).toHaveAttribute("aria-invalid", "false");
	});

	it("[ISSUE-3510-ITEM-5] the owner's error marks the field while its record is shown", async () => {
		const { model } = peopleModel();
		render(ui({ model, selected: "2", error: true }));
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		expect(combobox()).toHaveAttribute("aria-invalid", "true");
	});

	it("[ISSUE-3510-ITEM-7] a record dropped by onLoadError is not shown as 'Loading…' when the parent keeps selected", async () => {
		const { model, connector } = peopleModel();
		render(
			ui({
				model,
				selected: "9",
				onLoadError: () => null,
				disableRequestBatching: true,
			}),
		);
		await flush();
		expect(connector.log).toContain("read:9");
		expect(combobox().value).toBe("");
	});

	it("[ISSUE-3510-ITEM-8] a new selection replaces the shown entry: fields the new entry leaves out are not kept", async () => {
		const rows: Row[] = [
			{ id: "1", name: "Alice", tip: "Inactive since 2020" },
			{ id: "2", name: "Bob" },
		];
		const connector = new SelectorTestConnector(rows);
		const model = makeSelectorModel(connector);
		const withTip = (record: Row): BaseSelectorData => ({
			...conv(record),
			...(record.tip ? { titleTooltip: record.tip as string } : {}),
		});
		const { rerender } = render(
			ui({
				model,
				selected: "1",
				modelToSelectorData: withTip,
				disableRequestBatching: true,
			}),
		);
		await waitFor(() =>
			expect(combobox()).toHaveAttribute("title", "Inactive since 2020"),
		);
		rerender(
			ui({
				model,
				selected: "2",
				modelToSelectorData: withTip,
				disableRequestBatching: true,
			}),
		);
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		expect(combobox()).not.toHaveAttribute("title", "Inactive since 2020");
	});

	it("[ISSUE-3510-ITEM-8] a new selection replaces the shown entry: the previous record's icon is not kept", async () => {
		const rows: Row[] = [
			{ id: "1", name: "Alice", tip: "Inactive since 2020" },
			{ id: "2", name: "Bob" },
		];
		const model = makeSelectorModel(new SelectorTestConnector(rows));
		const withIcon = (record: Row): BaseSelectorData => ({
			...conv(record),
			...(record.tip ? { icon: <span data-testid={"inactive-icon"} /> } : {}),
		});
		const { rerender } = render(
			ui({
				model,
				selected: "1",
				modelToSelectorData: withIcon,
				enableIcons: true,
				disableRequestBatching: true,
			}),
		);
		await waitFor(() => expect(combobox().value).toBe("Alice"));
		expect(screen.getByTestId("inactive-icon")).toBeInTheDocument();
		rerender(
			ui({
				model,
				selected: "2",
				modelToSelectorData: withIcon,
				enableIcons: true,
				disableRequestBatching: true,
			}),
		);
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		expect(screen.queryByTestId("inactive-icon")).toBeNull();
	});

	it("[ISSUE-3510-ITEM-9] a new modelToSelectorData (e.g. after a language switch) is applied to the shown selection", async () => {
		const { model } = peopleModel();
		const upper = (record: Row): BaseSelectorData => ({
			value: record.id as string,
			label: (record.name as string).toUpperCase(),
		});
		const { rerender } = render(
			ui({ model, selected: "2", disableRequestBatching: true }),
		);
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		rerender(
			ui({
				model,
				selected: "2",
				modelToSelectorData: upper,
				disableRequestBatching: true,
			}),
		);
		await flush();
		expect(combobox().value).toBe("BOB");
	});
});

describe("BackendSingleSelect bugs (debounced search)", () => {
	it("[ISSUE-3510-ITEM-19] a parent render between two keystrokes does not send the first search", async () => {
		vi.useFakeTimers();
		try {
			const { model, connector } = peopleModel();
			let bump!: () => void;
			const InlineProps = () => {
				const [, setCount] = useState(0);
				bump = () => setCount((count) => count + 1);
				// written inline, as apps do: a new array and a new function per render
				return field({
					model,
					searchDebounceTime: 300,
					sort: [{ field: "name", direction: 1 }],
					modelToSelectorData: (record) => conv(record),
				});
			};
			render(
				<Framework>
					<InlineProps />
				</Framework>,
			);
			await act(() => vi.advanceTimersByTimeAsync(1000));
			await openList();
			await act(() => vi.advanceTimersByTimeAsync(1000));
			connector.log.length = 0;
			await typeText("A");
			act(() => bump());
			await act(() => vi.advanceTimersByTimeAsync(100));
			await typeText("Al");
			await act(() => vi.advanceTimersByTimeAsync(1000));
			expect(connector.log).toEqual(["index:Al"]);
		} finally {
			vi.useRealTimers();
		}
	});

	it("[ISSUE-3510-ITEM-19] a search still waiting for its debounce is not sent after unmount", async () => {
		vi.useFakeTimers();
		try {
			const { model, connector } = peopleModel();
			const { unmount } = render(ui({ model, searchDebounceTime: 300 }));
			await act(() => vi.advanceTimersByTimeAsync(1000));
			await openList();
			await act(() => vi.advanceTimersByTimeAsync(1000));
			connector.log.length = 0;
			await typeText("A");
			unmount();
			await act(() => vi.advanceTimersByTimeAsync(1000));
			expect(connector.log).toEqual([]);
		} finally {
			vi.useRealTimers();
		}
	});
});

/**
 * SelectorTestConnector whose rows marked `inactive` match only while the search sends
 * the `additionalFilters` entry `show_inactive: true`
 */
class InactiveFilterConnector extends SelectorTestConnector {
	protected matching(
		params?: Parameters<SelectorTestConnector["index"]>[0],
	): Row[] {
		const list = super.matching(params);
		return params?.additionalFilters?.show_inactive === true
			? list
			: list.filter((row) => !row.inactive);
	}
}

/** people() plus Alfred (id "6"), who is inactive */
const peopleWithInactive = () => {
	const connector = new InactiveFilterConnector([
		...people(),
		{ id: "6", name: "Alfred", inactive: true },
	]);
	return { connector, model: makeSelectorModel(connector) };
};

const optionNames = () =>
	screen.queryAllByRole("option").map((option) => option.textContent);

describe("BackendSingleSelect bugs (switch filter)", () => {
	it("[ISSUE-3465-ITEM-7] with switchFilterName, turning the switch on reloads the options with that filter set", async () => {
		const { model, connector } = peopleWithInactive();
		render(
			ui({
				model,
				switchFilterName: "show_inactive",
				switchLabel: "Show inactive",
			}),
		);
		await openList();
		await waitFor(() => expect(optionNames()).toContain("Alice"));
		expect(optionNames()).not.toContain("Alfred");
		expect(connector.params.at(-1)?.additionalFilters).toEqual({
			show_inactive: false,
		});
		const toggle = screen.getByRole("switch", { name: "Show inactive" });
		expect(toggle).not.toBeChecked();
		fireEvent.click(toggle);
		await flush();
		expect(toggle).toBeChecked();
		await waitFor(() => expect(optionNames()).toContain("Alfred"));
		expect(connector.params.at(-1)?.additionalFilters).toEqual({
			show_inactive: true,
		});
	});

	it("[ISSUE-3465-ITEM-7] defaultSwitchValue starts the switch on: the first search sends the filter as true", async () => {
		const { model, connector } = peopleWithInactive();
		render(
			ui({
				model,
				switchFilterName: "show_inactive",
				switchLabel: "Show inactive",
				defaultSwitchValue: true,
			}),
		);
		expect(screen.getByRole("switch", { name: "Show inactive" })).toBeChecked();
		await openList();
		await waitFor(() => expect(optionNames()).toContain("Alfred"));
		expect(connector.params.map((params) => params.additionalFilters)).toEqual(
			connector.params.map(() => ({ show_inactive: true })),
		);
	});

	it("[ISSUE-3465-ITEM-7] without switchFilterName the field shows no switch and searches send no additionalFilters", async () => {
		const { model, connector } = peopleWithInactive();
		render(ui({ model, switchLabel: "Show inactive" }));
		await openList();
		await waitFor(() => expect(optionNames()).toContain("Alice"));
		expect(screen.queryByRole("switch")).toBeNull();
		expect(connector.params.length).toBeGreaterThan(0);
		expect(connector.params.map((params) => params.additionalFilters)).toEqual(
			connector.params.map(() => undefined),
		);
	});

	it("[ISSUE-3465-ITEM-7] displaySwitch is no prop of BackendSingleSelect: passed anyway, it shows no switch that filters nothing", async () => {
		const { model } = peopleWithInactive();
		render(
			<Framework>
				<BackendSingleSelect
					model={model}
					modelToSelectorData={conv}
					label={"Person"}
					selected={null}
					// @ts-expect-error the switch comes with switchFilterName, which also filters
					displaySwitch
					switchLabel={"Show inactive"}
				/>
			</Framework>,
		);
		await flush();
		expect(screen.queryByRole("switch")).toBeNull();
	});
});

describe("BackendSingleSelect: the shown entry follows modelToSelectorData, modelFetch and refreshToken", () => {
	/** conv, but with the name in capitals: a modelToSelectorData for another language */
	const upper = (record: Row): BaseSelectorData => ({
		value: record.id as string,
		label: (record.name as string).toUpperCase(),
	});

	it("[ISSUE-3510-ITEM-9] a new modelToSelectorData converts a picked entry again, without a request", async () => {
		const { model, connector } = peopleModel();
		const { rerender } = render(
			<Framework>
				<Parent model={model} disableRequestBatching />
			</Framework>,
		);
		await openList();
		await pickOption("Bob");
		expect(combobox().value).toBe("Bob");
		rerender(
			<Framework>
				<Parent
					model={model}
					modelToSelectorData={upper}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		expect(combobox().value).toBe("BOB");
		expect(lookups(connector)).toEqual([]);
	});

	it("[ISSUE-3510-ITEM-9] a new modelToSelectorData converts an initialData entry again, without a request", async () => {
		const { model, connector } = peopleModel();
		const initialData = [{ id: "2", name: "Bob" }];
		const { rerender } = render(
			ui({ model, selected: "2", initialData, disableRequestBatching: true }),
		);
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		rerender(
			ui({
				model,
				selected: "2",
				initialData,
				modelToSelectorData: upper,
				disableRequestBatching: true,
			}),
		);
		await flush();
		expect(combobox().value).toBe("BOB");
		expect(lookups(connector)).toEqual([]);
	});

	it("[ISSUE-3510-ITEM-9] an additionalOptions entry is neither converted nor loaded again", async () => {
		const { model, connector } = peopleModel();
		const additionalOptions = [{ value: "nobody", label: "Nobody" }];
		const { rerender } = render(
			ui({ model, selected: "nobody", additionalOptions }),
		);
		await flush();
		expect(combobox().value).toBe("Nobody");
		rerender(
			ui({
				model,
				selected: "nobody",
				additionalOptions,
				modelToSelectorData: upper,
				refreshToken: "refreshed",
			}),
		);
		await flush();
		expect(combobox().value).toBe("Nobody");
		expect(lookups(connector)).toEqual([]);
	});

	it("[ISSUE-3510-ITEM-9] a new refreshToken after a rename loads the shown record again, and the field keeps the old name until it has loaded", async () => {
		const { model, connector } = peopleModel();
		const { rerender } = render(
			ui({ model, selected: "2", disableRequestBatching: true }),
		);
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		// renamed in a dialog: the app invalidates the model's queries and refreshes
		connector.rows[1].name = "Bobby";
		await act(() => model.invalidateQueries());
		const release = connector.hold("2");
		rerender(
			ui({
				model,
				selected: "2",
				disableRequestBatching: true,
				refreshToken: "renamed",
			}),
		);
		await flush();
		expect(combobox().value).toBe("Bob");
		await release();
		expect(combobox().value).toBe("Bobby");
		expect(lookups(connector)).toEqual(["read:2", "read:2"]);
	});

	it("[ISSUE-3510-ITEM-9] a record that is gone when the field loads it again is dropped like one that cannot be loaded", async () => {
		const { model, connector } = peopleModel();
		const onSelect = vi.fn();
		const props = {
			model,
			selected: "2",
			onSelect,
			onLoadError: () => null,
			disableRequestBatching: true,
		};
		const { rerender } = render(ui(props));
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		connector.rows.splice(1, 1);
		await act(() => model.invalidateQueries());
		rerender(ui({ ...props, refreshToken: "deleted" }));
		await flush();
		expect(onSelect).toHaveBeenCalledWith(null);
		// the parent keeps "2": the field no longer shows Bob
		expect(combobox().value).toBe("");
	});

	it("[ISSUE-3510-ITEM-9] an id onLoadError dropped while the parent keeps it is not looked up again for a new modelToSelectorData", async () => {
		const { model, connector } = peopleModel();
		const props = {
			model,
			selected: "9",
			onLoadError: () => null,
			disableRequestBatching: true,
		};
		const { rerender } = render(ui(props));
		await flush();
		expect(lookups(connector)).toEqual(["read:9"]);
		rerender(ui({ ...props, modelToSelectorData: upper }));
		await flush();
		expect(lookups(connector)).toEqual(["read:9"]);
		expect(combobox().value).toBe("");
	});

	it("[ISSUE-3510-ITEM-9] a modelFetch with other cache keys loads the shown record again through it; a new instance of the same model does not", async () => {
		const { model, connector } = peopleModel();
		// records that go stale at once: every load through this model reaches the connector
		const options = { cacheOptions: { staleTime: 0 } };
		const fetchModel = (
			connector: SelectorTestConnector,
			cacheKeys?: unknown,
		): ModelUnknown =>
			new Model(model.modelId, model.fields, connector, cacheKeys, options);
		const props = { model, selected: "2", disableRequestBatching: true };
		const { rerender } = render(
			ui({ ...props, modelFetch: fetchModel(connector) }),
		);
		await waitFor(() => expect(combobox().value).toBe("Bob"));
		// rebuilt on a render (or a language switch): same model id, same cache keys
		rerender(ui({ ...props, modelFetch: fetchModel(connector) }));
		await flush();
		expect(lookups(connector)).toEqual(["read:2"]);
		// another scope: other cache keys, whose record of 2 has another name
		const scoped = new SelectorTestConnector(
			people().map((row) => (row.id === "2" ? { ...row, name: "Bobby" } : row)),
		);
		rerender(ui({ ...props, modelFetch: fetchModel(scoped, ["other scope"]) }));
		await waitFor(() => expect(combobox().value).toBe("Bobby"));
		expect(lookups(scoped)).toEqual(["read:2"]);
		expect(lookups(connector)).toEqual(["read:2"]);
	});

	it("[ISSUE-3510-ITEM-9] a modelToSelectorData passed anew while the record loads loads it once, and the last one converts it", async () => {
		const { model, connector } = peopleModel();
		const release = connector.hold("3");
		const props = { model, selected: "3", disableRequestBatching: true };
		const { rerender } = render(ui(props));
		await flush();
		rerender(ui({ ...props, modelToSelectorData: (record) => conv(record) }));
		await flush();
		rerender(ui({ ...props, modelToSelectorData: upper }));
		await release();
		expect(combobox().value).toBe("CAROL");
		expect(lookups(connector)).toEqual(["read:3"]);
	});
});
