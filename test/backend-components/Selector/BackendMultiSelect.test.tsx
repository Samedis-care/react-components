/**
 * The multi selectors over a model of people (backendSelectorFixture): BackendMultiSelect
 * and its display cache useSelectedCache (shared with BackendMultipleSelect and
 * BackendMultiSelectWithTags): how the selected ids are resolved and listed.
 */
// first: BackendMultipleSelect cannot be the first components-care module imported (import cycle)
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
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "../../../src/backend-components/Selector/BackendMultiSelect";
import BackendMultipleSelect from "../../../src/backend-components/Selector/BackendMultipleSelect";
import BackendMultiSelectWithTags from "../../../src/backend-components/Selector/BackendMultiSelectWithTags";
import type { ModelUnknown } from "../../../src/backend-integration";
import type { MultiSelectorData } from "../../../src/standalone";
import { PartialExcept } from "../../../src/utils/distributiveOmit";
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

type Props = PartialExcept<
	BackendMultiSelectProps<ModelUnknown, MultiSelectorData>,
	"switchFilterName" | "switchLabel" | "defaultSwitchValue"
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

/** conv, but throws for a record without a name, as a modelToSelectorData can for a record it cannot read */
const convNamed = (record: Record<string, unknown>) => {
	if (typeof record.name !== "string")
		throw new Error(`Record ${record.id as string} has no name`);
	return conv(record);
};

/**
 * Alice, Bob and Carol, Bob without his name: convNamed fails for this record of Bob, not
 * for the one the backend has
 */
const initialWithoutBobsName = () => [
	{ id: "1", name: "Alice" },
	{ id: "2" },
	{ id: "3", name: "Carol" },
];

/** The part of Node's process collectUnhandled uses (the test config has no Node types) */
interface RejectionEvents {
	listeners(event: "unhandledRejection"): ((reason: unknown) => void)[];
	removeAllListeners(event: "unhandledRejection"): void;
	on(event: "unhandledRejection", listener: (reason: unknown) => void): void;
	off(event: "unhandledRejection", listener: (reason: unknown) => void): void;
}

const nodeProcess = (globalThis as unknown as { process: RejectionEvents })
	.process;

/**
 * Runs `body` and returns the rejections it left unhandled, collected instead of failing
 * the whole run
 */
const collectUnhandled = async (
	body: () => Promise<void>,
): Promise<unknown[]> => {
	const vitestHandlers = nodeProcess.listeners("unhandledRejection");
	nodeProcess.removeAllListeners("unhandledRejection");
	const unhandled: unknown[] = [];
	const collect = (reason: unknown) => void unhandled.push(reason);
	nodeProcess.on("unhandledRejection", collect);
	try {
		await body();
		// unhandled rejections are reported on a later macrotask
		await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
	} finally {
		nodeProcess.off("unhandledRejection", collect);
		vitestHandlers.forEach((handler) =>
			nodeProcess.on("unhandledRejection", handler),
		);
	}
	return unhandled;
};

// ---------------------------------------------------------------------------
// Bugs (each test asserts the correct behavior and fails until it is fixed)
// ---------------------------------------------------------------------------

describe("BackendMultiSelect bugs", () => {
	it("[ISSUE-3510-ITEM-2] an id dropped by onLoadError does not undo a pick made while it loaded", async () => {
		const { model, connector } = peopleModel();
		connector.fail["1"] = new Error("gone");
		const release = connector.hold("1");
		const { Parent, state } = makeParent();
		render(
			<Framework>
				<Parent
					model={model}
					initial={["1"]}
					onLoadError={() => null}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		await openList();
		await typeText("Bo");
		await pickOption("Bob");
		expect(state.current).toEqual(["1", "2"]);
		await release();
		expect(state.current).toEqual(["2"]);
	});

	it("[ISSUE-3510-ITEM-2] an id dropped by onLoadError does not bring back an entry removed while it loaded", async () => {
		const { model, connector } = peopleModel();
		connector.fail["1"] = new Error("gone");
		const release = connector.hold("1");
		const { Parent, state } = makeParent();
		render(
			<Framework>
				<Parent
					model={model}
					initial={["1", "2"]}
					onLoadError={() => null}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		// the second entry is Bob's (by position: while 1 loads it may read "Loading…" too)
		fireEvent.click(screen.getAllByRole("button", { name: /^Remove / })[1]);
		await flush();
		expect(state.current).toEqual(["1"]);
		await release();
		expect(state.current).toEqual([]);
	});

	it("[ISSUE-3510-ITEM-2] a record picked again while its earlier lookup failed is not dropped", async () => {
		const { model, connector } = peopleModel();
		// reading 1 fails (e.g. modelFetch is another endpoint), the search still lists Alice
		connector.fail["1"] = new Error("gone");
		const release = connector.hold("1");
		const { Parent, state } = makeParent();
		render(
			<Framework>
				<Parent
					model={model}
					initial={["1"]}
					onLoadError={() => null}
					disableRequestBatching
				/>
			</Framework>,
		);
		await flush();
		fireEvent.click(screen.getByRole("button", { name: /^Remove / }));
		await flush();
		expect(state.current).toEqual([]);
		await openList();
		await typeText("Al");
		await pickOption("Alice");
		expect(state.current).toEqual(["1"]);
		await release();
		expect(state.current).toEqual(["1"]);
		expect(removeButtons()).toEqual(["Remove Alice"]);
	});

	it("[ISSUE-3510-ITEM-2] an id that two lookups drop before the parent renders is reported once", async () => {
		const { model, connector } = peopleModel();
		const release = connector.hold("9");
		const onSelect = vi.fn<(ids: string[], raw: MultiSelectorData[]) => void>();
		const props = {
			model,
			onSelect,
			onLoadError: () => null,
			disableRequestBatching: true,
		};
		const { rerender } = render(ui({ ...props, selected: ["9"] }));
		await flush();
		// an outside change while 9 loads: the field looks 9 up for the new selection too
		rerender(ui({ ...props, selected: ["9", "2"] }));
		await flush();
		await release();
		expect(onSelect.mock.calls.map(([ids]) => ids)).toEqual([["2"]]);
	});

	it("[ISSUE-3510-ITEM-2] an id dropped after the field unmounted is not reported", async () => {
		const { model, connector } = peopleModel();
		connector.fail["1"] = new Error("gone");
		const release = connector.hold("1");
		const onSelect = vi.fn();
		const { unmount } = render(
			ui({
				model,
				selected: ["1", "2"],
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

	it("[ISSUE-3510-ITEM-5] an entry that cannot be loaded is not named by the developer message", async () => {
		const { model } = peopleModel();
		render(ui({ model, selected: ["9", "2"] }));
		await waitFor(() => expect(removeButtons()).toContain("Remove Bob"));
		removeButtons().forEach((name) =>
			expect(name).not.toMatch(/\[Components-Care\]/),
		);
	});

	it("[ISSUE-3510-ITEM-5] an entry that cannot be loaded marks the field invalid until it is removed", async () => {
		const { model } = peopleModel();
		const { Parent, state } = makeParent();
		render(
			<Framework>
				<Parent model={model} initial={["9", "2"]} />
			</Framework>,
		);
		await waitFor(() =>
			expect(removeButtons()).toEqual(["Remove Unknown entry", "Remove Bob"]),
		);
		expect(combobox()).toHaveAttribute("aria-invalid", "true");
		fireEvent.click(
			screen.getByRole("button", { name: "Remove Unknown entry" }),
		);
		await flush();
		expect(state.current).toEqual(["2"]);
		expect(combobox()).toHaveAttribute("aria-invalid", "false");
	});

	it("[ISSUE-3510-ITEM-5] onSelect's raw reports an entry that cannot be loaded as its id and label", async () => {
		const { model } = peopleModel();
		const onSelect = vi.fn();
		const { Parent } = makeParent();
		render(
			<Framework>
				<Parent model={model} initial={["9", "2"]} onSelect={onSelect} />
			</Framework>,
		);
		await waitFor(() => expect(removeButtons()).toContain("Remove Bob"));
		fireEvent.click(screen.getByRole("button", { name: "Remove Bob" }));
		await flush();
		expect(onSelect.mock.calls).toEqual([
			[["9"], [{ value: "9", label: "Unknown entry" }]],
		]);
		expect(combobox()).toHaveAttribute("aria-invalid", "true");
	});

	it("[ISSUE-3510-ITEM-5] BackendMultipleSelect: an entry that cannot be loaded marks the field invalid", async () => {
		const { model } = peopleModel();
		render(
			<Framework>
				<BackendMultipleSelect<ModelUnknown, MultiSelectorData>
					model={model}
					modelToSelectorData={conv}
					label={"Departments"}
					searchDebounceTime={0}
					selected={["9", "2"]}
				/>
			</Framework>,
		);
		await waitFor(() => expect(combobox().value).toMatch(/Bob/));
		expect(combobox().value.trim()).toBe("Unknown entry, Bob");
		expect(combobox()).toHaveAttribute("aria-invalid", "true");
	});

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

	it("[ISSUE-3510-ITEM-24] an initialData record whose modelToSelectorData rejects gets the load-error label, the others are shown, and nothing is left unhandled", async () => {
		const { model, connector } = peopleModel();
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const unhandled = await collectUnhandled(async () => {
			render(
				ui({
					model,
					selected: ["1", "2", "3"],
					initialData: initialWithoutBobsName(),
					modelToSelectorData: (record) =>
						Promise.resolve().then(() => convNamed(record)),
				}),
			);
			await flush();
		});
		expect({
			unhandled: unhandled.map(String),
			entries: removeButtons(),
			lookups: lookups(connector),
		}).toEqual({
			unhandled: [],
			entries: [
				"Remove Alice",
				"Remove Error while fetching data",
				"Remove Carol",
			],
			lookups: [],
		});
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("record 2"),
			expect.objectContaining({ message: "Record 2 has no name" }),
		);
	});

	it("[ISSUE-3510-ITEM-24] onLoadError gets the conversion error of an initialData record, and its null drops the id without a lookup", async () => {
		const { model, connector } = peopleModel();
		vi.spyOn(console, "warn").mockImplementation(() => {});
		const onLoadError = vi.fn<(error: Error) => string | null>(() => null);
		const { Parent, state } = makeParent();
		render(
			<Framework>
				<Parent
					model={model}
					initial={["1", "2", "3"]}
					initialData={initialWithoutBobsName()}
					modelToSelectorData={convNamed}
					onLoadError={onLoadError}
				/>
			</Framework>,
		);
		await flush();
		expect({
			selection: state.current,
			entries: removeButtons(),
			lookups: lookups(connector),
			errors: onLoadError.mock.calls.map(([error]) => error.message),
		}).toEqual({
			selection: ["1", "3"],
			entries: ["Remove Alice", "Remove Carol"],
			lookups: [],
			errors: ["Record 2 has no name"],
		});
	});

	it("[ISSUE-3510-ITEM-24] an initialData record is converted when its id is selected: one that fails while nobody selected it is not reported", async () => {
		const { model, connector } = peopleModel();
		vi.spyOn(console, "warn").mockImplementation(() => {});
		const onLoadError = vi.fn<(error: Error) => string | null>(
			() => "Bob is unreadable",
		);
		const props = {
			model,
			initialData: initialWithoutBobsName().slice(0, 2),
			modelToSelectorData: convNamed,
			onLoadError,
		};
		const { rerender } = render(ui({ ...props, selected: ["1"] }));
		await flush();
		expect({
			entries: removeButtons(),
			errors: onLoadError.mock.calls.length,
		}).toEqual({ entries: ["Remove Alice"], errors: 0 });
		rerender(ui({ ...props, selected: ["1", "2"] }));
		await flush();
		expect({
			entries: removeButtons(),
			lookups: lookups(connector),
			errors: onLoadError.mock.calls.length,
		}).toEqual({
			entries: ["Remove Alice", "Remove Bob is unreadable"],
			lookups: [],
			errors: 1,
		});
	});

	it("[ISSUE-3510-ITEM-24] BackendMultiSelectWithTags: an initialData record whose convData throws gets the load-error label, the others are shown", async () => {
		const group = peopleModel([{ id: "A", name: "Team A" }]);
		const data = peopleModel();
		vi.spyOn(console, "warn").mockImplementation(() => {});
		render(
			<Framework>
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
					convData={convNamed}
					getGroupDataEntries={() => []}
					groupSearchDebounceTime={0}
					dataSearchDebounceTime={0}
					initialData={initialWithoutBobsName()}
					selected={["1", "2", "3"]}
				/>
			</Framework>,
		);
		await flush();
		expect({
			entries: removeButtons(),
			lookups: lookups(data.connector),
		}).toEqual({
			entries: [
				"Remove Alice",
				"Remove Error while fetching data",
				"Remove Carol",
			],
			lookups: [],
		});
	});
});
