/**
 * CrudMultiSelectWithGroups while it loads the join rows of its connector and after that
 * load failed. The searched model is TestModel (people "1".."8"); a join row is
 * { id, source_id }, its entry is labelled "L<source_id>".
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CrudMultiSelectWithGroups from "../../../src/backend-components/Selector/CrudMultiSelectWithGroups";
import type { ErrorComponentProps } from "../../../src/backend-components/Form";
import type { Connector, ModelUnknown } from "../../../src/backend-integration";
import type { ResponseMeta } from "../../../src/backend-integration/Connector/Connector";
import type ApiConnector from "../../../src/backend-integration/Connector/ApiConnector";
import LazyConnector from "../../../src/backend-integration/Connector/LazyConnector";
import { Framework } from "../../../src/framework";
import createTestModel from "../../../src/stories/test-utils/TestModel";
import type {
	BaseSelectorData,
	MultiSelectorData,
} from "../../../src/standalone";
import { settle, setupFormTests } from "../Form/formFixture";
import {
	flush,
	openList,
	pickOption,
	removeButtons,
	typeText,
} from "./backendSelectorFixture";

setupFormTests();

interface JoinData extends MultiSelectorData {
	source_id: string;
}

type Rows = Record<string, unknown>[];

/**
 * A join collection whose index answers once the test settles it
 */
const makeDeferredBackend = () => {
	let resolve: (result: [Rows, ResponseMeta]) => void = () => {};
	let reject: (error: Error) => void = () => {};
	const result = new Promise<[Rows, ResponseMeta]>(
		(resolveLoad, rejectLoad) => {
			resolve = resolveLoad;
			reject = rejectLoad;
		},
	);
	const connector = {
		index: vi.fn(() => result),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	} as unknown as Connector;
	return {
		connector,
		resolve: (rows: Rows) =>
			resolve([rows, { totalRows: rows.length, filteredRows: rows.length }]),
		reject: (error: Error) => reject(error),
	};
};

const serialize = (data: JoinData) => ({
	id: data.value.startsWith("to-create-") ? undefined : data.value,
	source_id: data.source_id,
});
const deserialize = (record: Record<string, unknown>): JoinData => ({
	value: record.id as string,
	label: "L" + String(record.source_id),
	source_id: record.source_id as string,
});
const deserializeModel = (record: Record<string, unknown>) => ({
	label: String(record.first_name),
	source_id: record.id as string,
});
const getIdOfData = (data: JoinData) => data.source_id;
const convGroup = (record: Record<string, unknown>): BaseSelectorData => ({
	value: record.id as string,
	label: "Team of " + String(record.first_name),
});
const getGroupDataEntries = (): JoinData[] => [];

const ErrorSink = (props: ErrorComponentProps) => (
	<div role={"alert"}>{props.error.message}</div>
);

const model = createTestModel();

const mountGroups = (
	connector: Connector,
	deserializeRecord: (
		record: Record<string, unknown>,
	) => JoinData | Promise<JoinData> = deserialize,
) =>
	render(
		<Framework>
			<CrudMultiSelectWithGroups<
				ModelUnknown,
				ModelUnknown,
				BaseSelectorData,
				JoinData
			>
				title={"Members"}
				searchInputLabel={"Add a person"}
				groupModel={model}
				dataModel={model}
				connector={connector}
				errorComponent={ErrorSink}
				convGroup={convGroup}
				getGroupDataEntries={getGroupDataEntries}
				serialize={serialize}
				deserialize={deserializeRecord}
				deserializeModel={deserializeModel}
				getIdOfData={getIdOfData}
				groupSearchDebounceTime={0}
				dataSearchDebounceTime={0}
			/>
		</Framework>,
	);

/**
 * Whether the group search, the first field, is disabled. The person search below it
 * follows disabled only once MultiSelectWithoutGroup passes it on (ISSUE-3488-ITEM-6).
 */
const groupSearchDisabled = () =>
	(screen.getAllByRole("combobox")[0] as HTMLInputElement).disabled;

describe("CrudMultiSelectWithGroups", () => {
	it("[ISSUE-3505-ITEM-15] keeps its title and fields while it loads, locked and busy, and can be edited once loaded", async () => {
		const be = makeDeferredBackend();
		const { container } = mountGroups(be.connector);
		await settle();

		expect(screen.getByText("Members")).toBeInTheDocument();
		expect(groupSearchDisabled()).toBe(true);
		expect(screen.getByRole("status")).toHaveTextContent("Loading…");
		expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();

		await act(async () => {
			be.resolve([{ id: "j1", source_id: "1" }]);
			await Promise.resolve();
		});
		await settle();

		expect(await screen.findByText("L1")).toBeInTheDocument();
		expect(groupSearchDisabled()).toBe(false);
		expect(screen.queryByRole("status")).toBeNull();
		expect(container.querySelector('[aria-busy="true"]')).toBeNull();
	});

	it("[ISSUE-3505-ITEM-15] keeps its title after a failed load and announces the failure in words that name it", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const be = makeDeferredBackend();
		mountGroups(be.connector);
		await settle();

		const failure = new Error("403 Forbidden: actors.reader missing");
		await act(async () => {
			be.reject(failure);
			await Promise.resolve();
		});
		await settle();

		expect(screen.getByText("Members")).toBeInTheDocument();
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Members could not be loaded.",
		);
		expect(screen.queryByText(/403 Forbidden/)).toBeNull();
		expect(warn).toHaveBeenCalledWith(expect.any(String), failure);
		expect(groupSearchDisabled()).toBe(true);
	});

	it("[ISSUE-3510-ITEM-20] a pick while a selected entry is still 'Loading…' neither updates nor removes its row", async () => {
		const create = vi.fn((data: Record<string, unknown>) =>
			Promise.resolve([{ ...data, id: "new-" + String(data.source_id) }, {}]),
		);
		const update = vi.fn();
		const remove = vi.fn();
		const connector = {
			index: vi.fn(() =>
				Promise.resolve([
					[{ id: "j1", source_id: "1" }],
					{ totalRows: 1, filteredRows: 1 },
				]),
			),
			create,
			update,
			delete: remove,
		} as unknown as Connector;
		// the selection loads at once, the field's entries of its rows wait
		let release!: () => void;
		const held = new Promise<void>((resolve) => (release = resolve));
		let calls = 0;
		const slowDeserialize = async (record: Record<string, unknown>) => {
			if (calls++ > 0) await held;
			return deserialize(record);
		};
		mountGroups(connector, slowDeserialize);
		await settle();
		expect(removeButtons()).toEqual(["Remove Loading…"]);

		const personInput = screen.getAllByRole<HTMLInputElement>("combobox")[1];
		await openList(personInput);
		await typeText("Bob", personInput);
		await pickOption("Bob");
		expect(create).toHaveBeenCalledWith({ id: undefined, source_id: "2" });
		expect(update).not.toHaveBeenCalled();
		expect(remove).not.toHaveBeenCalled();

		await act(async () => {
			release();
			await Promise.resolve();
		});
		await settle();
		// j1 is listed from its row once the field has built its entry
		expect(removeButtons()[0]).toBe("Remove L1");
	});

	it("[ISSUE-3509-ITEM-16] marks the field busy and says that a removal is being saved until its delete settled", async () => {
		let release!: () => void;
		const held = new Promise<void>((resolve) => (release = resolve));
		const remove = vi.fn(() => held);
		const connector = {
			index: vi.fn(() =>
				Promise.resolve([
					[
						{ id: "j1", source_id: "1" },
						{ id: "j2", source_id: "2" },
					],
					{ totalRows: 2, filteredRows: 2 },
				]),
			),
			create: vi.fn(),
			update: vi.fn(),
			delete: remove,
		} as unknown as Connector;
		const { container } = mountGroups(connector);
		const button = await screen.findByRole("button", { name: "Remove L1" });
		await settle();
		expect(screen.queryByRole("status")).toBeNull();

		fireEvent.click(button);
		await settle();
		expect(remove).toHaveBeenCalledWith("j1");
		expect(screen.getByRole("status")).toHaveTextContent("Saving…");
		expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();

		await act(async () => {
			release();
			await Promise.resolve();
		});
		await settle();
		expect(removeButtons()).toEqual(["Remove L2"]);
		expect(screen.queryByRole("status")).toBeNull();
		expect(container.querySelector('[aria-busy="true"]')).toBeNull();
	});
});

describe("CrudMultiSelectWithGroups with a LazyConnector", () => {
	/**
	 * The join rows on the server behind the LazyConnector; `calls` logs every write that
	 * reaches them (`create:<source_id>`, `update:<id>`, `delete:<id>`)
	 */
	class JoinBackend {
		readonly calls: string[] = [];
		private counter = 0;

		constructor(private rows: Rows) {}

		index = () =>
			Promise.resolve([
				this.rows.map((row) => ({ ...row })),
				{ totalRows: this.rows.length, filteredRows: this.rows.length },
			]);

		create = (data: Record<string, unknown>) => {
			this.calls.push("create:" + String(data.source_id));
			const record = { ...data, id: "srv-" + String(++this.counter) };
			this.rows.push(record);
			return Promise.resolve([record, {}]);
		};

		update = (data: Record<string, unknown>) => {
			this.calls.push("update:" + String(data.id));
			return Promise.resolve([data, {}]);
		};

		delete = (id: string) => {
			this.calls.push("delete:" + id);
			this.rows = this.rows.filter((row) => row.id !== id);
			return Promise.resolve();
		};
	}

	type Props = React.ComponentProps<
		typeof CrudMultiSelectWithGroups<
			ModelUnknown,
			ModelUnknown,
			BaseSelectorData,
			JoinData
		>
	>;

	/** j1 (person 1, "L1") and j2 (person 2, "L2") */
	const TWO_ROWS = (): Rows => [
		{ id: "j1", source_id: "1" },
		{ id: "j2", source_id: "2" },
	];

	/** renders the control on a LazyConnector over the rows, as an app's wrapper does */
	const mountLazy = async (
		rows: Rows,
		extra: Partial<Pick<Props, "showDirtyState" | "getGroupDataEntries">> = {},
	) => {
		const backend = new JoinBackend(rows);
		const lazy = new LazyConnector(backend as unknown as ApiConnector, false);
		const ui = render(
			<Framework>
				<CrudMultiSelectWithGroups<
					ModelUnknown,
					ModelUnknown,
					BaseSelectorData,
					JoinData
				>
					title={"Members"}
					searchInputLabel={"Add a person"}
					groupModel={model}
					dataModel={model}
					connector={lazy}
					errorComponent={ErrorSink}
					convGroup={convGroup}
					getGroupDataEntries={getGroupDataEntries}
					serialize={serialize}
					deserialize={deserialize}
					deserializeModel={deserializeModel}
					getIdOfData={getIdOfData}
					groupSearchDebounceTime={0}
					dataSearchDebounceTime={0}
					{...extra}
				/>
			</Framework>,
		);
		await flush();
		await screen.findAllByRole("button", { name: /^Remove L/ });
		return { backend, lazy, ...ui };
	};

	/** each entry's text with its mark ("L2Added"), in the order shown */
	const entries = () =>
		screen
			.queryAllByRole("button", { name: /^(Remove|Restore) / })
			.map((button) => button.parentElement!.textContent);

	const personField = () =>
		screen.getAllByRole<HTMLInputElement>("combobox")[1];

	// picked from the whole list: a typed search text would be added again when the field
	// loses focus, a defect of the search field of its own
	const pickPerson = async (name: string) => {
		await openList(personField());
		await pickOption(name);
	};

	const click = async (name: string) => {
		fireEvent.click(screen.getByRole("button", { name }));
		await flush();
	};

	/** sends the queue, as the Form's save does */
	const save = async (lazy: LazyConnector) => {
		await act(async () => {
			await lazy.workQueue();
		});
		await flush();
	};

	it("[ISSUE-3505-ITEM-23] marks a queued pick as added, in text, until the queue is sent", async () => {
		const { backend, lazy } = await mountLazy([{ id: "j1", source_id: "1" }]);

		await pickPerson("Bob");
		const queued = entries();
		const sentBefore = [...backend.calls];
		await save(lazy);

		expect({
			queued,
			sentBefore,
			saved: entries(),
			sent: backend.calls,
		}).toEqual({
			queued: ["L1", "L2Added"],
			sentBefore: [],
			saved: ["L1", "L2"],
			sent: ["create:2"],
		});
	});

	it("[ISSUE-3505-ITEM-23] keeps a queued removal listed after the selection, marked removed, with a restore button instead of the remove button, until the queue is sent", async () => {
		const { backend, lazy } = await mountLazy(TWO_ROWS());

		await click("Remove L1");

		expect(entries()).toEqual(["L2", "L1Removed"]);
		expect(screen.queryByRole("button", { name: "Remove L1" })).toBeNull();
		expect(
			screen.getByRole("button", { name: "Restore L1" }),
		).toBeInTheDocument();
		expect(
			screen.getByText("L1").closest(".CcMultiSelectWithoutGroup-removed"),
		).not.toBeNull();
		expect(backend.calls).toEqual([]);

		await save(lazy);
		expect(backend.calls).toEqual(["delete:j1"]);
		expect(entries()).toEqual(["L2"]);
	});

	it("[ISSUE-3505-ITEM-23] restoring a queued removal selects the entry again and sends nothing", async () => {
		const { backend, lazy } = await mountLazy(TWO_ROWS());
		await click("Remove L1");

		await click("Restore L1");

		expect(entries()).toEqual(["L2", "L1"]);
		expect(
			screen.getByRole("button", { name: "Remove L1" }),
		).toBeInTheDocument();
		expect(lazy.isQueueEmpty()).toBe(true);
		await save(lazy);
		expect(backend.calls).toEqual([]);
	});

	it("[ISSUE-3505-ITEM-23] does not offer a removed entry in the search: it comes back through its restore button", async () => {
		await mountLazy(TWO_ROWS());
		await click("Remove L1");

		await openList(personField());

		const offered = screen
			.getAllByRole("option")
			.map((option) => option.textContent);
		expect(offered).toContain("Carol");
		expect(offered).not.toContain("Alice");
	});

	it("[ISSUE-3505-ITEM-23] a group pick restores a removed entry of the group instead of adding it a second time", async () => {
		const { backend, lazy } = await mountLazy(TWO_ROWS(), {
			getGroupDataEntries: () => [
				{ value: "to-create-1", label: "Alice", source_id: "1" },
				{ value: "to-create-3", label: "Carol", source_id: "3" },
			],
		});
		await click("Remove L1");

		await openList(screen.getAllByRole<HTMLInputElement>("combobox")[0]);
		await pickOption("Team of Alice");
		await save(lazy);

		expect(backend.calls).toEqual(["create:3"]);
		expect(entries()).toEqual(["L2", "L1", "L3"]);
	});

	it("[ISSUE-3505-ITEM-23] with showDirtyState the title is marked while changes are queued, and not without it", async () => {
		/** the title's dirty marker (an element after the text), if any */
		const marked = () =>
			screen.getByText("Members").querySelector("span") !== null;

		const first = await mountLazy(TWO_ROWS(), { showDirtyState: true });
		const before = marked();
		await click("Remove L1");
		const queued = marked();
		await save(first.lazy);
		const saved = marked();
		first.unmount();

		await mountLazy(TWO_ROWS());
		await click("Remove L1");
		const withoutShowDirtyState = marked();

		expect({ before, queued, saved, withoutShowDirtyState }).toEqual({
			before: false,
			queued: true,
			saved: false,
			withoutShowDirtyState: false,
		});
	});
});
