/**
 * CrudMultiSelect with an immediate connector: the join rows of a collection are listed,
 * and every pick, removal and update is written at once. The searched model is TestModel
 * (people "1".."8": Alice, Bob, Carol, …); a join row is { id, source_id, note }, its entry
 * is labelled "L<source_id>". Every request is logged ("create:2", "delete:j1",
 * "update:j1:b"); creates and deletes can be held in flight. Read-only and with blocked
 * writes, the entries capture the select context (a read-only field renders no end
 * adornment).
 */
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import CrudMultiSelect, {
	CrudMultiSelectProps,
	useCrudSelectContext,
} from "../../../src/backend-components/Selector/CrudMultiSelect";
import type { CrudSelectDispatch } from "../../../src/backend-components/Selector/useCrudSelect";
import type { ErrorComponentProps } from "../../../src/backend-components/Form";
import type { Connector, ModelUnknown } from "../../../src/backend-integration";
import { Framework } from "../../../src/framework";
import createTestModel from "../../../src/stories/test-utils/TestModel";
import type { MultiSelectorData } from "../../../src/standalone";
import MultiSelectEntry, {
	MultiSelectEntryProps,
} from "../../../src/standalone/Selector/MultiSelectEntry";
import { settle, setupFormTests } from "../Form/formFixture";

setupFormTests();

interface JoinData extends MultiSelectorData {
	source_id: string;
	note?: string;
}

const makeBackend = (initial: Record<string, unknown>[] = []) => {
	const rows = new Map<string, Record<string, unknown>>();
	initial.forEach((row) => rows.set(row.id as string, { ...row }));
	let nextId = 100;
	const calls: string[] = [];
	const gates: { create?: Promise<void>; delete?: Promise<void> } = {};
	const create = vi.fn(async (data: Record<string, unknown>) => {
		if (gates.create) await gates.create;
		calls.push("create:" + String(data.source_id));
		const record = { ...data, id: String(nextId++) };
		rows.set(record.id, record);
		return [record, {}];
	});
	const update = vi.fn((data: Record<string, unknown>) => {
		calls.push("update:" + String(data.id) + ":" + String(data.note));
		rows.set(data.id as string, { ...rows.get(data.id as string), ...data });
		return Promise.resolve([data, {}]);
	});
	const del = vi.fn(async (id: string) => {
		if (gates.delete) await gates.delete;
		calls.push("delete:" + String(id));
		if (!rows.has(id)) throw new Error("not found " + String(id));
		rows.delete(id);
	});
	const index = vi.fn(() => {
		const list = Array.from(rows.values()).map((row) => ({ ...row }));
		return Promise.resolve([
			list,
			{ totalRows: list.length, filteredRows: list.length },
		]);
	});
	const hold = (kind: "create" | "delete") => {
		let release!: () => void;
		gates[kind] = new Promise<void>((resolve) => (release = resolve));
		return () => {
			gates[kind] = undefined;
			release();
		};
	};
	return {
		connector: { index, create, update, delete: del } as unknown as Connector,
		rows,
		calls,
		create,
		update,
		del,
		index,
		hold,
	};
};
type Backend = ReturnType<typeof makeBackend>;

const serialize = (data: JoinData) => ({
	id: data.value.startsWith("to-create-") ? undefined : data.value,
	source_id: data.source_id,
	note: data.note,
});
const deserialize = (record: Record<string, unknown>): JoinData => ({
	value: record.id as string,
	label: "L" + String(record.source_id),
	source_id: record.source_id as string,
	note: record.note as string | undefined,
});
const deserializeModel = (record: Record<string, unknown>) => ({
	label: String(record.first_name),
	source_id: record.id as string,
});
const getIdOfData = (data: JoinData) => data.source_id;

/** shows the error as an alert, the way an inline error component should */
const ErrorSink = (props: ErrorComponentProps) => (
	<div role={"alert"}>{props.error.message}</div>
);

// what a test passes on top; without the switch, whose two props go together
type Extra = Partial<
	Omit<
		CrudMultiSelectProps<ModelUnknown, JoinData>,
		"switchFilterName" | "switchLabel"
	>
>;

const model = createTestModel();

const selector = (be: Backend, extra: Extra = {}) => (
	<CrudMultiSelect<ModelUnknown, JoinData>
		model={model}
		connector={be.connector}
		errorComponent={ErrorSink}
		serialize={serialize}
		deserialize={deserialize}
		deserializeModel={deserializeModel}
		getIdOfData={getIdOfData}
		label={"Members"}
		placeholder={"Search people"}
		searchDebounceTime={0}
		{...extra}
	/>
);

const mount = (be: Backend, extra: Extra = {}) =>
	render(<Framework>{selector(be, extra)}</Framework>);

const removeButtons = () =>
	screen
		.queryAllByRole("button", { name: /^Remove / })
		.map((button) => button.getAttribute("aria-label"));

/** the texts of the status messages on the page */
const statuses = () =>
	screen.queryAllByRole("status").map((status) => status.textContent);

/** whether anything on the page is marked busy */
const busy = (container: HTMLElement) =>
	container.querySelector('[aria-busy="true"]') !== null;

/** what the select context said about the writes, in the order of the renders */
const writingSink: boolean[] = [];
/** an end adornment that records the context's `writing` */
const WritingProbe = () => {
	writingSink.push(useCrudSelectContext().writing);
	return null;
};

/** what the select context says, as the entries see it */
const ctxSink: { disabled?: boolean } = {};
const CaptureEntry = (props: MultiSelectEntryProps<JoinData>) => {
	ctxSink.disabled = useCrudSelectContext().disabled;
	return <MultiSelectEntry {...props} />;
};

beforeEach(() => {
	ctxSink.disabled = undefined;
	writingSink.length = 0;
});

const mountSelect = (
	connector: Connector,
	props: { readOnly?: boolean; blockWrites?: boolean },
) => {
	const ref = React.createRef<CrudSelectDispatch<JoinData>>();
	render(
		<Framework>
			<CrudMultiSelect<ModelUnknown, JoinData>
				ref={ref}
				label={"Members"}
				model={model}
				connector={connector}
				errorComponent={ErrorSink}
				serialize={serialize}
				deserialize={deserialize}
				deserializeModel={deserializeModel}
				getIdOfData={getIdOfData}
				selectedEntryRenderer={CaptureEntry}
				searchDebounceTime={0}
				{...props}
			/>
		</Framework>,
	);
	return ref;
};

/** picks source 2 through the ref; resolves with the rejection, or null */
const pickThroughRef = async (
	ref: React.RefObject<CrudSelectDispatch<JoinData> | null>,
) => {
	let outcome: unknown = undefined;
	let pending: Promise<void> | undefined;
	act(() => {
		pending = ref
			.current!.addToSelection({
				value: "to-create-2",
				label: "L2",
				source_id: "2",
			})
			.then(
				() => {
					outcome = null;
				},
				(e: unknown) => {
					outcome = e;
				},
			);
	});
	await act(async () => {
		await pending;
	});
	await settle();
	return outcome;
};

describe("CrudMultiSelect", () => {
	it("[ISSUE-3505-ITEM-16] read-only: the entries under the label, no search field or remove buttons, and nothing is written", async () => {
		const be = makeBackend([{ id: "j1", source_id: "1" }]);
		const ref = mountSelect(be.connector, { readOnly: true });
		expect(await screen.findByText("L1")).toBeInTheDocument();
		await settle();

		expect(screen.queryByRole("combobox")).toBeNull();
		expect(
			within(screen.getByRole("list", { name: "Members" })).getByText("L1"),
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Remove L1" })).toBeNull();
		expect(ctxSink.disabled).toBe(true);
		expect(await pickThroughRef(ref)).toBeInstanceOf(Error);
		expect(be.calls).toEqual([]);
		expect(screen.queryByText("L2")).toBeNull();
	});

	it("[ISSUE-3505-ITEM-16] blockWrites: the field stays as it is, but a removal or a pick writes nothing", async () => {
		const be = makeBackend([{ id: "j1", source_id: "1" }]);
		const ref = mountSelect(be.connector, { blockWrites: true });
		expect(await screen.findByText("L1")).toBeInTheDocument();
		await settle();
		const input = screen.getByRole("combobox", { name: "Members" });

		expect(input).toBeEnabled();
		expect(input).not.toHaveAttribute("readonly");
		expect(ctxSink.disabled).toBe(true);
		fireEvent.click(screen.getByRole("button", { name: "Remove L1" }));
		await settle();
		expect(await pickThroughRef(ref)).toBeInstanceOf(Error);
		expect(be.calls).toEqual([]);
		expect(screen.getByText("L1")).toBeInTheDocument();
		expect(screen.queryByText("L2")).toBeNull();
	});
});

describe("CrudMultiSelect bugs", () => {
	it("[ISSUE-3509-ITEM-16] marks the field busy while a removal is being written", async () => {
		const be = makeBackend([
			{ id: "j1", source_id: "1" },
			{ id: "j2", source_id: "2" },
		]);
		const { container } = mount(be);
		const remove = await screen.findByRole("button", { name: "Remove L1" });
		const release = be.hold("delete");
		fireEvent.click(remove);
		await settle();
		expect(be.del).toHaveBeenCalledTimes(1);
		expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
		release();
		await settle();
	});

	it("[ISSUE-3509-ITEM-16] says that a removal is being saved until its delete settled, and then lists the change", async () => {
		const be = makeBackend([
			{ id: "j1", source_id: "1" },
			{ id: "j2", source_id: "2" },
		]);
		const { container } = mount(be);
		const remove = await screen.findByRole("button", { name: "Remove L1" });
		await settle();
		expect(statuses()).toEqual([]);
		expect(busy(container)).toBe(false);

		const release = be.hold("delete");
		fireEvent.click(remove);
		await settle();
		expect(statuses()).toEqual(["Saving…"]);
		expect(busy(container)).toBe(true);
		expect(removeButtons()).toEqual(["Remove L1", "Remove L2"]);

		await act(async () => {
			release();
			await Promise.resolve();
		});
		await settle();
		expect(removeButtons()).toEqual(["Remove L2"]);
		expect(statuses()).toEqual([]);
		expect(busy(container)).toBe(false);
		expect(be.calls).toEqual(["delete:j1"]);
	});

	it("[ISSUE-3509-ITEM-16] is busy and says so while a pick is being created, also when the backend refuses it", async () => {
		const be = makeBackend([{ id: "j1", source_id: "1" }]);
		const { container } = mount(be);
		await screen.findByRole("button", { name: "Remove L1" });
		const input = screen.getByRole("combobox");
		fireEvent.mouseDown(input);
		fireEvent.change(input, { target: { value: "Bo" } });
		const option = await screen.findByRole("option", { name: /Bob/ });

		let refuse!: () => void;
		const refused = new Promise<void>((resolve) => (refuse = resolve));
		be.create.mockImplementationOnce(async () => {
			await refused;
			throw new Error("duplicate");
		});
		fireEvent.click(option);
		await settle();
		expect(be.create).toHaveBeenCalledTimes(1);
		expect(statuses()).toContain("Saving…");
		expect(busy(container)).toBe(true);

		await act(async () => {
			refuse();
			await Promise.resolve();
		});
		await settle();
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Bob: duplicate",
		);
		expect(statuses()).not.toContain("Saving…");
		expect(busy(container)).toBe(false);
	});

	it("[ISSUE-3509-ITEM-16] is not busy while prepareNewEntry asks for the new entry's data, only while the entry is created", async () => {
		const be = makeBackend([{ id: "j1", source_id: "1" }]);
		let answer!: (entry: JoinData | null) => void;
		const prepareNewEntry = vi.fn(
			(entry: JoinData) =>
				new Promise<JoinData | null>((resolve) => {
					answer = (prepared) => resolve(prepared && { ...entry, ...prepared });
				}),
		);
		const { container } = mount(be, { prepareNewEntry });
		await screen.findByRole("button", { name: "Remove L1" });
		const input = screen.getByRole("combobox");
		fireEvent.mouseDown(input);
		fireEvent.change(input, { target: { value: "Bo" } });
		fireEvent.click(await screen.findByRole("option", { name: /Bob/ }));
		await settle();
		expect(prepareNewEntry).toHaveBeenCalledTimes(1);
		expect(statuses()).not.toContain("Saving…");
		expect(busy(container)).toBe(false);

		const release = be.hold("create");
		await act(async () => {
			answer({ value: "to-create-2", label: "Bob", source_id: "2", note: "n" });
			await Promise.resolve();
		});
		await settle();
		expect(be.create).toHaveBeenCalledTimes(1);
		expect(statuses()).toContain("Saving…");
		expect(busy(container)).toBe(true);

		await act(async () => {
			release();
			await Promise.resolve();
		});
		expect(
			await screen.findByRole("button", { name: "Remove L2" }),
		).toBeInTheDocument();
		await settle();
		expect(statuses()).not.toContain("Saving…");
		expect(busy(container)).toBe(false);
	});

	it("[ISSUE-3509-ITEM-16] the context's writing is true while a change is written, and stays false for a change that writes nothing", async () => {
		const be = makeBackend([
			{ id: "j1", source_id: "1" },
			{ id: "j2", source_id: "2" },
		]);
		let ctx!: ReturnType<typeof useCrudSelectContext>;
		const Probe = () => {
			ctx = useCrudSelectContext();
			return <WritingProbe />;
		};
		mount(be, { endAdornment: <Probe /> });
		const remove = await screen.findByRole("button", { name: "Remove L1" });
		await settle();
		expect(writingSink.length).toBeGreaterThan(0);
		expect(writingSink.includes(true)).toBe(false);

		// the selection handed back as it is listed: nothing to write. Rendered once
		// while the change runs, and again once it is applied.
		let unchanged: Promise<void> | undefined;
		act(() => {
			unchanged = ctx.handleSelect(
				ctx.selected.map((entry) => entry.value),
				ctx.selected,
			);
		});
		await act(async () => {
			await unchanged;
		});
		await settle();
		expect(be.calls).toEqual([]);
		expect(writingSink.includes(true)).toBe(false);

		const release = be.hold("delete");
		fireEvent.click(remove);
		await settle();
		expect(writingSink[writingSink.length - 1]).toBe(true);
		await act(async () => {
			release();
			await Promise.resolve();
		});
		await settle();
		expect(writingSink[writingSink.length - 1]).toBe(false);
		expect(be.calls).toEqual(["delete:j1"]);
	});

	it("[ISSUE-3509-ITEM-16] a pick through addToSelection is busy until its create returns", async () => {
		const be = makeBackend([{ id: "j1", source_id: "1" }]);
		const ref = mountSelect(be.connector, {});
		await screen.findByRole("button", { name: "Remove L1" });
		await settle();
		const release = be.hold("create");
		let added: Promise<void> | undefined;
		act(() => {
			added = ref.current!.addToSelection({
				value: "to-create-2",
				label: "L2",
				source_id: "2",
			});
		});
		await settle();
		expect(statuses()).toEqual(["Saving…"]);

		await act(async () => {
			release();
			await added;
		});
		await settle();
		expect(removeButtons()).toEqual(["Remove L1", "Remove L2"]);
		expect(statuses()).toEqual([]);
	});
});
