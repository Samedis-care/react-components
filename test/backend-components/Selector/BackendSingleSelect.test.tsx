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
import type { ModelUnknown } from "../../../src/backend-integration";
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

type Props = Partial<BackendSingleSelectProps<ModelUnknown>> & {
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
