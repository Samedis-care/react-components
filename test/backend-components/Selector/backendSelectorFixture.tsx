/**
 * Shared scaffolding of the backend selector tests (BackendSingleSelect, BackendMultiSelect,
 * BackendMultipleSelect, BackendMultiSelectWithTags, BackendDataGridMultiSelect,
 * FormSelectors): a model of people on a connector that logs every request, honours
 * quickFilter, page/rows and the `id` inSet/notInSet field filter, and can hold or fail
 * single lookups.
 *
 * Request log entries:
 * - `index:<quickFilter>` a search
 * - `index:<quickFilter>:ids=<ids>` an `id inSet` query (a batched lookup, or the
 *   selected rows of BackendDataGridMultiSelect)
 * - `index:<quickFilter>:not=<ids>` an `id notInSet` query
 * - `index2:<offset>+<rows>` an offset query (GridTestConnector only)
 * - `read:<id>` a single lookup (disableRequestBatching)
 *
 * Every model gets its own id from a counter, so two models never share react-query cache
 * entries or a RequestBatching key.
 *
 * Not a test file itself (no `.test.` in the name), so vitest only runs it through the files
 * that import it.
 */
import { act, fireEvent, screen } from "@testing-library/react";
import Connector, {
	ConnectorIndex2Params,
	ResponseMeta,
} from "../../../src/backend-integration/Connector/Connector";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelUnknown,
	ModelVisibilityDisabled,
	ModelVisibilityEditRequired,
	ModelVisibilityGridView,
} from "../../../src/backend-integration";
import type { IDataGridLoadDataParameters } from "../../../src/standalone/DataGrid/DataGrid";
import type { BaseSelectorData } from "../../../src/standalone";

export type Row = Record<string, unknown>;

/** Alice, Bob, Carol, Alina, Albert (ids "1" to "5") */
export const people = (): Row[] => [
	{ id: "1", name: "Alice" },
	{ id: "2", name: "Bob" },
	{ id: "3", name: "Carol" },
	{ id: "4", name: "Alina" },
	{ id: "5", name: "Albert" },
];

/** The selector entry of a person: value is the id, label the name */
export const conv = (record: Row): BaseSelectorData => ({
	value: record.id as string,
	label: record.name as string,
});

type IndexParams = Partial<IDataGridLoadDataParameters>;

export class SelectorTestConnector extends Connector {
	/** every request, in order (see the file comment) */
	readonly log: string[] = [];
	/** the params of every index call, in order */
	readonly params: IndexParams[] = [];
	/**
	 * errors thrown by read of an id (disableRequestBatching); a batched lookup ignores them
	 * and fails only for ids missing from rows
	 */
	readonly fail: Record<string, Error> = {};
	/**
	 * true: meta is `{ totalRows: all rows, filteredRows: matches }`; false: only
	 * `{ totalRows: matches }` (as SCF's connector reports it)
	 */
	reportFiltered = true;
	private readonly gates: Record<string, Promise<void> | undefined> = {};

	constructor(public rows: Row[]) {
		super();
	}

	/**
	 * Holds every lookup of the id (read, and a batched `id inSet` query naming it) until
	 * the returned release is called; release lets the held requests and their renders finish
	 */
	hold(id: string): () => Promise<void> {
		let release!: () => void;
		const gate = new Promise<void>((resolve) => (release = resolve));
		this.gates[id] = gate;
		return async () => {
			delete this.gates[id];
			release();
			await flush();
		};
	}

	protected matching(params?: IndexParams): Row[] {
		let list = this.rows;
		const query = (params?.quickFilter ?? "").toLowerCase();
		if (query)
			list = list.filter((row) =>
				String(row.name).toLowerCase().includes(query),
			);
		const ids = params?.fieldFilter?.id;
		if (ids) {
			const set = ids.value1 ? ids.value1.split(",") : [];
			list = list.filter((row) =>
				ids.type === "inSet"
					? set.includes(row.id as string)
					: !set.includes(row.id as string),
			);
		}
		return list;
	}

	protected meta(list: Row[]): ResponseMeta {
		return this.reportFiltered
			? { totalRows: this.rows.length, filteredRows: list.length }
			: { totalRows: list.length };
	}

	protected describe(params?: IndexParams): string {
		const ids = params?.fieldFilter?.id;
		return (
			(params?.quickFilter ?? "") +
			(ids ? (ids.type === "inSet" ? ":ids=" : ":not=") + ids.value1 : "")
		);
	}

	async index(params?: IndexParams): Promise<[Row[], ResponseMeta, unknown?]> {
		this.log.push("index:" + this.describe(params));
		this.params.push(params ?? {});
		const ids = params?.fieldFilter?.id;
		if (ids?.type === "inSet") {
			for (const id of ids.value1.split(",")) {
				if (this.gates[id]) await this.gates[id];
			}
		}
		await Promise.resolve();
		const list = this.matching(params);
		const page = params?.page ?? 1;
		const size = params?.rows ?? 25;
		return [
			list.slice((page - 1) * size, page * size).map((row) => ({ ...row })),
			this.meta(list),
		];
	}

	async read(id: string): Promise<[Row, Record<string, Row[]>]> {
		this.log.push("read:" + id);
		if (this.gates[id]) await this.gates[id];
		if (this.fail[id]) throw this.fail[id];
		const row = this.rows.find((entry) => entry.id === id);
		if (!row) throw new Error(`Record "${id}" not found`);
		return [{ ...row }, {}];
	}

	create(): never {
		throw new Error("not supported");
	}

	update(): never {
		throw new Error("not supported");
	}

	delete(): never {
		throw new Error("not supported");
	}
}

/** SelectorTestConnector with its own index2 (offset paging), as BackendDataGridMultiSelect wants */
export class GridTestConnector extends SelectorTestConnector {
	async index2(
		params: ConnectorIndex2Params,
	): Promise<[Row[], ResponseMeta, unknown?]> {
		this.log.push(
			`index2:${params.offset}+${params.rows}` + this.describe(params),
		);
		await Promise.resolve();
		const list = this.matching(params);
		return [
			list
				.slice(params.offset, params.offset + params.rows)
				.map((row) => ({ ...row })),
			this.meta(list),
		];
	}
}

let modelCounter = 0;

/**
 * A model with the fields id (not in the grid), name and tip (both grid columns and
 * searchable) on the given connector
 */
export const makeSelectorModel = (connector: Connector): ModelUnknown => {
	const text = (label: string) => ({
		type: new ModelDataTypeStringRendererMUI(),
		getLabel: () => label,
		filterable: true,
		sortable: true,
		visibility: {
			overview: ModelVisibilityGridView,
			edit: ModelVisibilityEditRequired,
			create: ModelVisibilityEditRequired,
		},
		customData: null,
	});
	return new Model(
		"u52-selector-" + String(++modelCounter),
		{
			id: {
				...text("ID"),
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityDisabled,
					create: ModelVisibilityDisabled,
				},
			},
			name: text("Name"),
			tip: text("Tip"),
		},
		connector,
	);
};

/** A model over people() and its connector */
export const peopleModel = (rows: Row[] = people()) => {
	const connector = new SelectorTestConnector(rows);
	return { connector, model: makeSelectorModel(connector) };
};

/** lets pending promises and the renders they cause finish */
export const flush = async () => {
	for (let i = 0; i < 10; i++) await act(() => Promise.resolve());
};

export const combobox = () => screen.getByRole<HTMLInputElement>("combobox");

/** focuses the input (typing needs focus) and opens the list */
export const openList = async (input: HTMLInputElement = combobox()) => {
	act(() => input.focus());
	fireEvent.mouseDown(input);
	await flush();
};

export const typeText = async (
	text: string,
	input: HTMLInputElement = combobox(),
) => {
	fireEvent.change(input, { target: { value: text } });
	await flush();
};

/** the names of the "Remove …" buttons of BackendMultiSelect's entries */
export const removeButtons = () =>
	screen
		.queryAllByRole("button", { name: /^Remove / })
		.map((button) => button.getAttribute("aria-label"));

/** clicks the option whose name matches, once it is listed */
export const pickOption = async (name: RegExp | string) => {
	fireEvent.click(await screen.findByRole("option", { name }));
	await flush();
};
