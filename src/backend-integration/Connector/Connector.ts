import {
	Model,
	AdvancedDeleteRequest,
	ModelFieldName,
	PageVisibility,
	ModelGetResponse,
} from "../Model";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid";
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
	 * @returns An array with all data entries as well as some meta data
	 */
	abstract index(
		params?: Partial<IDataGridLoadDataParameters>,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<[Record<KeyT, unknown>[], ResponseMeta]>;

	/**
	 * Creates a new data entry with the given data
	 * @param data The initial data for the entry
	 * @param model The model performing the request
	 * @returns The full newly created data entry
	 */
	abstract create(
		data: Record<string, unknown>,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<Record<KeyT, unknown>>;

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
	): Promise<Record<KeyT, unknown>>;

	/**
	 * Deletes a specific data entry
	 * @param id The ID of the data entry to delete
	 * @param model The model performing the request
	 */
	abstract delete(
		id: string,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<void>;

	/**
	 * Delets multiple data entries at once. Should be overwritten if implemented by your backend.
	 * @param ids The IDs of the data entries to delete
	 * @param model The model performing the request
	 */
	async deleteMultiple(
		ids: string[],
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<void> {
		void (await Promise.all(ids.map((id) => this.delete(id, model))));
	}

	/**
	 * Advanced deletion handler which supports delete all
	 * @param req The deletion request
	 * @protected
	 */
	public deleteAdvanced?: (
		req: AdvancedDeleteRequest,
		model?: Model<KeyT, VisibilityT, CustomT>
	) => Promise<void>;

	/**
	 * DataGrid exporters supported by this backend connector
	 */
	public dataGridExporters?: IDataGridExporter<unknown>[];
}

export default Connector;
