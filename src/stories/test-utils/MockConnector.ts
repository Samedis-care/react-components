import Connector, {
	ResponseMeta,
} from "../../backend-integration/Connector/Connector";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import {
	ModelFieldName,
	ModelGetResponse,
	PageVisibility,
} from "../../backend-integration/Model";

/**
 * A simple in-memory Connector for Storybook stories.
 * Stores data in a Map and supports index (with pagination/filtering/sorting),
 * create, read, update, and delete operations.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class MockConnector extends Connector<ModelFieldName, PageVisibility, any> {
	private data: Map<string, Record<string, unknown>>;
	private nextId: number;

	constructor(initialData?: Record<string, unknown>[]) {
		super();
		this.data = new Map();
		this.nextId = 1;
		if (initialData) {
			initialData.forEach((record) => {
				const id = (record.id as string) ?? String(this.nextId++);
				this.data.set(id, { ...record, id });
				const numId = parseInt(id, 10);
				if (!isNaN(numId) && numId >= this.nextId) {
					this.nextId = numId + 1;
				}
			});
		}
	}

	/* eslint-disable @typescript-eslint/require-await */
	async index(
		params?: Partial<IDataGridLoadDataParameters>,
	): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]> {
		/* eslint-enable @typescript-eslint/require-await */
		let rows = Array.from(this.data.values());

		// Quick filter
		if (params?.quickFilter) {
			const q = params.quickFilter.toLowerCase();
			rows = rows.filter((row) =>
				Object.values(row).some(
					(v) => typeof v === "string" && v.toLowerCase().includes(q),
				),
			);
		}

		// Sorting
		if (params?.sort && params.sort.length > 0) {
			const { field, direction } = params.sort[0];
			rows.sort((a, b) => {
				const av = a[field];
				const bv = b[field];
				if (av == null || bv == null) return 0;
				const as = typeof av === "string" ? av : "";
				const bs = typeof bv === "string" ? bv : "";
				return as < bs ? -direction : as > bs ? direction : 0;
			});
		}

		const totalRows = this.data.size;
		const filteredRows = rows.length;
		const page = params?.page ?? 1;
		const pageSize = params?.rows ?? 25;
		const start = (page - 1) * pageSize;
		const end = start + pageSize;

		return [rows.slice(start, end), { totalRows, filteredRows }];
	}

	create(data: Record<string, unknown>): ModelGetResponse<ModelFieldName> {
		const id = String(this.nextId++);
		const record = { ...data, id };
		this.data.set(id, record);
		return [record, {}];
	}

	read(id: string): ModelGetResponse<ModelFieldName> {
		const record = this.data.get(id);
		if (!record) {
			throw new Error(`Record with id "${id}" not found`);
		}
		return [{ ...record }, {}];
	}

	update(
		data: Record<ModelFieldName, unknown>,
	): ModelGetResponse<ModelFieldName> {
		const id = data.id as string;
		const existing = this.data.get(id);
		if (!existing) {
			throw new Error(`Record with id "${id}" not found`);
		}
		const updated = { ...existing, ...data };
		this.data.set(id, updated);
		return [updated, {}];
	}

	delete(id: string): void {
		this.data.delete(id);
	}
}

export default MockConnector;
