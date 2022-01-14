import {
	Model,
	AdvancedDeleteRequest,
	ModelFieldName,
	PageVisibility,
	ModelGetResponse,
} from "../Model";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import { IDataGridExporter } from "../../standalone/DataGrid/Header";

export interface ResponseMeta {
	/**
	 * The total amount of rows
	 */
	totalRows: number;
	/**
	 * The amount of rows being shown (if a filter is set)
	 */
	filteredRows?: number;
}

export type ConnectorIndex2Params = Partial<
	Omit<IDataGridLoadDataParameters, "page" | "rows">
> & {
	offset: number;
	rows: number;
};

/**
 * A generic backend connector which provides a basic CRUD interface for data
 */
abstract class Connector<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> {
	/**
	 * Lists all available data entries
	 * @param params Filter, Sorting and Pagination parameters
	 * @param model The model requesting the data (if any)
	 * @returns Array An array with all data entries as well as some meta data.
	 * 								The third element in the array is user-defined
	 */
	abstract index(
		params?: Partial<IDataGridLoadDataParameters>,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;

	/**
	 * Index function, which works with offsets, rather than pages
	 * @see index
	 * @remarks This should be implemented by application developers if possible, it allows for increased efficiency.
	 *          This function should be avoided if you are developing Components-Care components, prefer the normal index function.
	 *          This function is poly-filled if not implemented by application developer, which is less efficient
	 *          and drops the user-defined third return value, as the polyfill merges multiple calls to index function into one.
	 */
	public async index2(
		params: ConnectorIndex2Params,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]> {
		const pageSize = 25; // we call the main index function with this page size
		if (params.rows < 0)
			throw new Error("This function may only be called with params.rows >= 0");
		let page = (params.offset / pageSize) | 0;
		let offset = page * pageSize;
		let rows = params.rows;
		const mergedResultSet = [];
		let lastMeta: ResponseMeta | null = null;

		do {
			const [resultSet, meta] = await this.index(
				Object.assign({}, params, { page: page + 1, rows: pageSize }),
				model
			);
			lastMeta = meta;

			const maxRows = meta.filteredRows ?? meta.totalRows;
			const recordStartIndex = params.offset - offset;
			const recordEndIndex =
				Math.min(params.offset + params.rows, maxRows) - offset;
			const copySet = resultSet.slice(
				Math.max(recordStartIndex, 0),
				Math.min(recordEndIndex, pageSize)
			);
			mergedResultSet.push(...copySet);

			if (offset + pageSize >= maxRows) break; // no more data

			// update vars
			page++;
			offset += pageSize;
			rows -= pageSize;
		} while (rows > 0);

		if (lastMeta == null) throw new Error("No metadata recorded");
		return [mergedResultSet, lastMeta];
	}

	/**
	 * Creates a new data entry with the given data
	 * @param data The initial data for the entry
	 * @param model The model performing the request
	 * @returns The full newly created data entry
	 */
	abstract create(
		data: Record<string, unknown>,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT>;

	/**
	 * Loads an existing data entry
	 * @param id The ID of the existing data entry
	 * @param model The model performing the request
	 * @returns The loaded data entry
	 */
	abstract read(
		id: string,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT>;

	/**
	 * Updates an already existing data entry
	 * @param data The given data including the ID of the data entry
	 * @param model The model performing the request
	 * @returns The modified data entry
	 */
	abstract update(
		data: Record<ModelFieldName, unknown>,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT>;

	/**
	 * Deletes a specific data entry
	 * @param id The ID of the data entry to delete
	 * @param model The model performing the request
	 */
	abstract delete(
		id: string,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<void> | void;

	/**
	 * Delets multiple data entries at once. Should be overwritten if implemented by your backend.
	 * @param ids The IDs of the data entries to delete
	 * @param model The model performing the request
	 */
	deleteMultiple(
		ids: string[],
		model?: Model<KeyT, VisibilityT, CustomT>
	): void;
	async deleteMultiple(
		ids: string[],
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<void> {
		await Promise.all(ids.map((id) => this.delete(id, model)));
	}

	/**
	 * Advanced deletion handler which supports delete all
	 * @param req The deletion request
	 * @protected
	 */
	public deleteAdvanced?: (
		req: AdvancedDeleteRequest,
		model?: Model<KeyT, VisibilityT, CustomT>
	) => Promise<void> | void;

	/**
	 * DataGrid exporters supported by this backend connector
	 */
	public dataGridExporters?: IDataGridExporter<unknown>[];
}

export default Connector;
