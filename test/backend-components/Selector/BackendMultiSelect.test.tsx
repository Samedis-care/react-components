/**
 * The multi selectors over a model of people (backendSelectorFixture): BackendMultiSelect
 * and its display cache useSelectedCache (shared with BackendMultipleSelect and
 * BackendMultiSelectWithTags): how the selected ids are resolved and listed.
 */
// first: BackendMultipleSelect cannot be the first components-care module imported (import cycle)
import "../../../src/standalone";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "../../../src/backend-components/Selector/BackendMultiSelect";
import BackendMultipleSelect from "../../../src/backend-components/Selector/BackendMultipleSelect";
import BackendMultiSelectWithTags from "../../../src/backend-components/Selector/BackendMultiSelectWithTags";
import type { ModelUnknown } from "../../../src/backend-integration";
import type { MultiSelectorData } from "../../../src/standalone";
import { setupFormTests } from "../Form/formFixture";
import {
	combobox,
	conv,
	flush,
	openList,
	peopleModel,
	pickOption,
	removeButtons,
	SelectorTestConnector,
	typeText,
} from "./backendSelectorFixture";

// jsdom has "ontouchstart" on window, so TextFieldWithHelp would add its touch Clear
// button next to Autocomplete's own one
vi.mock("../../../src/utils/isTouchDevice", () => ({ default: () => false }));

setupFormTests();

type Props = Partial<
	BackendMultiSelectProps<ModelUnknown, MultiSelectorData>
> & {
	model: ModelUnknown;
};

const field = (props: Props) => (
	<BackendMultiSelect<ModelUnknown, MultiSelectorData>
		modelToSelectorData={conv}
		label={"People"}
		searchDebounceTime={0}
		selected={[]}
		{...props}
	/>
);

const ui = (props: Props) => <Framework>{field(props)}</Framework>;

/** a parent that applies every onSelect to selected; `current` holds the latest value */
const makeParent = () => {
	const state = { current: [] as string[] };
	const Parent = ({
		initial = [],
		onSelect,
		...props
	}: Props & { initial?: string[] }) => {
		const [selected, setSelected] = useState<string[]>(initial);
		state.current = selected;
		return field({
			...props,
			selected,
			onSelect: (ids, raw) => {
				onSelect?.(ids, raw);
				setSelected(ids);
			},
		});
	};
	return { Parent, state };
};

const lookups = (connector: SelectorTestConnector) =>
	connector.log.filter(
		(entry) => entry.startsWith("read:") || entry.includes(":ids="),
	);

// ---------------------------------------------------------------------------
// Bugs (each test asserts the correct behavior and fails until it is fixed)
// ---------------------------------------------------------------------------

describe("BackendMultiSelect bugs", () => {
	it("[ISSUE-3510-ITEM-6] an id that matches an additionalOptions entry is listed from that entry, without a lookup", async () => {
		const { model, connector } = peopleModel();
		render(
			ui({
				model,
				selected: ["none", "2"],
				additionalOptions: [{ value: "none", label: "No department" }],
			}),
		);
		await waitFor(() => expect(removeButtons()).toContain("Remove Bob"));
		expect(removeButtons()).toEqual(["Remove No department", "Remove Bob"]);
		expect(lookups(connector)).toEqual(["index::ids=2"]);
	});

	it("[ISSUE-3510-ITEM-6] an additionalOptions id is not dropped by onLoadError when the field mounts", async () => {
		const { model } = peopleModel();
		const onSelect = vi.fn();
		render(
			ui({
				model,
				selected: ["none", "2"],
				additionalOptions: [{ value: "none", label: "No department" }],
				onLoadError: () => null,
				onSelect,
			}),
		);
		await waitFor(() => expect(removeButtons()).toContain("Remove Bob"));
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("[ISSUE-3510-ITEM-6] a drop by onLoadError keeps an additionalOptions id and reports it with its entry", async () => {
		const { model, connector } = peopleModel();
		const onSelect = vi.fn();
		render(
			ui({
				model,
				selected: ["none", "9"],
				additionalOptions: [{ value: "none", label: "No department" }],
				onLoadError: () => null,
				onSelect,
				disableRequestBatching: true,
			}),
		);
		await waitFor(() => expect(onSelect).toHaveBeenCalled());
		expect(onSelect.mock.calls).toEqual([
			[["none"], [{ value: "none", label: "No department" }]],
		]);
		expect(lookups(connector)).toEqual(["read:9"]);
	});

	it("[ISSUE-3510-ITEM-6] BackendMultipleSelect shows an additionalOptions id from that entry, without a lookup", async () => {
		const { model, connector } = peopleModel();
		render(
			<Framework>
				<BackendMultipleSelect<ModelUnknown, MultiSelectorData>
					model={model}
					modelToSelectorData={conv}
					label={"Departments"}
					searchDebounceTime={0}
					selected={["none", "2"]}
					additionalOptions={[{ value: "none", label: "No department" }]}
				/>
			</Framework>,
		);
		await waitFor(() => expect(combobox().value).toMatch(/Bob/));
		expect(combobox().value.trim()).toBe("No department, Bob");
		expect(lookups(connector)).toEqual(["index::ids=2"]);
	});

	it("[ISSUE-3510-ITEM-20] onSelect's raw does not pass a 'Loading…' placeholder off as an entry", async () => {
		const { model, connector } = peopleModel();
		const release = connector.hold("1");
		const onSelect = vi.fn();
		const { Parent } = makeParent();
		render(
			<Framework>
				<Parent
					model={model}
					initial={["1"]}
					onSelect={onSelect}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		await openList();
		await typeText("Bo");
		await pickOption("Bob");
		expect(onSelect.mock.calls[0][0]).toEqual(["1", "2"]);
		const raw = onSelect.mock.calls[0][1] as MultiSelectorData[];
		expect(raw).toContainEqual({ value: "2", label: "Bob" });
		// a still-loading entry is either left out of raw or recognisably marked
		expect(raw).not.toContainEqual({ value: "1", label: "Loading…" });
		await release();
	});

	it("[ISSUE-3510-ITEM-20] a pick and a removal while an entry loads report its id without an entry", async () => {
		const { model, connector } = peopleModel();
		const release = connector.hold("1");
		const onSelect = vi.fn();
		const { Parent } = makeParent();
		render(
			<Framework>
				<Parent
					model={model}
					initial={["1"]}
					onSelect={onSelect}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		await openList();
		await typeText("Bo");
		await pickOption("Bob");
		fireEvent.click(screen.getByRole("button", { name: "Remove Bob" }));
		await flush();
		await release();
		expect(onSelect.mock.calls).toEqual([
			[["1", "2"], [{ value: "2", label: "Bob" }]],
			[["1"], []],
		]);
		expect(removeButtons()).toEqual(["Remove Alice"]);
	});

	it("[ISSUE-3510-ITEM-20] a drop by onLoadError does not report the 'Loading…' entry a pick handed back", async () => {
		const { model, connector } = peopleModel();
		const release = connector.hold("1");
		const onSelect = vi.fn();
		const props = {
			model,
			onSelect,
			onLoadError: () => null,
			disableRequestBatching: true,
		};
		const { rerender } = render(ui({ ...props, selected: ["1"] }));
		await flush();
		await openList();
		await typeText("Bo");
		await pickOption("Bob");
		rerender(ui({ ...props, selected: ["1", "2"] }));
		await flush();
		// 9 does not exist: onLoadError drops it
		rerender(ui({ ...props, selected: ["1", "2", "9"] }));
		await flush();
		await release();
		expect(onSelect.mock.calls).toEqual([
			[["1", "2"], [{ value: "2", label: "Bob" }]],
			[["1", "2"], [{ value: "2", label: "Bob" }]],
		]);
	});

	it("[ISSUE-3510-ITEM-20] BackendMultiSelectWithTags: a group pick that ends after an entry loaded neither reports nor lists that entry as 'Loading…'", async () => {
		const group = peopleModel([{ id: "A", name: "Team A" }]);
		const data = peopleModel();
		const releaseAlice = data.connector.hold("1");
		const releaseTeam = group.connector.hold("A");
		const onChange = vi.fn();
		const getGroupDataEntries = () => [{ value: "2", label: "Bob" }];
		const Parent = () => {
			const [selected, setSelected] = useState<string[]>(["1"]);
			return (
				<BackendMultiSelectWithTags<
					ModelUnknown,
					ModelUnknown,
					MultiSelectorData,
					MultiSelectorData
				>
					title={"Members"}
					searchInputLabel={"Add a person"}
					groupModel={group.model}
					dataModel={data.model}
					convGroup={conv}
					convData={conv}
					getGroupDataEntries={getGroupDataEntries}
					groupSearchDebounceTime={0}
					dataSearchDebounceTime={0}
					selected={selected}
					onChange={(ids, raw) => {
						onChange(ids, raw);
						setSelected(ids);
					}}
				/>
			);
		};
		render(
			<Framework>
				<Parent />
			</Framework>,
		);
		await flush();
		const groupInput = screen.getAllByRole<HTMLInputElement>("combobox")[0];
		await openList(groupInput);
		await typeText("Team", groupInput);
		// the group's entries load while Alice does, and arrive after her
		await pickOption(/Team A/);
		await releaseAlice();
		expect(removeButtons()).toEqual(["Remove Alice"]);
		await releaseTeam();
		expect(onChange.mock.calls).toEqual([
			[["1", "2"], [{ value: "2", label: "Bob" }]],
		]);
		expect(removeButtons()).toEqual(["Remove Alice", "Remove Bob"]);
	});
});
