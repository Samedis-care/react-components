import { AdvancedDeleteRequest, ModelFieldName } from "../Model";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid";
import { IDataGridExporter } from "../../standalone/DataGrid/Header";

export interface ResponseMeta {
	/**
	 * The total amount of rows
	 */
	totalRows: number;
}

/**
 * A generic backend connector which provides a basic CRUD interface for data
 */
abstract class Connector<KeyT extends ModelFieldName> {
	/**
	 * Lists all available data entries
	 * @param params Filter, Sorting and Pagination parameters
	 * @returns An array with all data entries as well as some meta data
	 */
	abstract async index(
		params?: Partial<IDataGridLoadDataParameters>
	): Promise<[Record<KeyT, unknown>[], ResponseMeta]>;

	/**
	 * Creates a new data entry with the given data
	 * @param data The initial data for the entry
	 * @returns The full newly created data entry
	 */
	abstract async create(
		data: Record<string, unknown>
	): Promise<Record<KeyT, unknown>>;

	/**
	 * Loads an existing data entry
	 * @param id The ID of the existing data entry
	 * @returns The loaded data entry
	 */
	abstract async read(id: string): Promise<Record<KeyT, unknown>>;

	/**
	 * Updates an already existing data entry
	 * @param data The given data including the ID of the data entry
	 * @returns The modified data entry
	 */
	abstract async update(
		data: Record<ModelFieldName, unknown>
	): Promise<Record<KeyT, unknown>>;

	/**
	 * Deletes a specific data entry
	 * @param id The ID of the data entry to delete
	 */
	abstract async delete(id: string): Promise<void>;

	/**
	 * Delets multiple data entries at once. Should be overwritten if implemented by your backend.
	 * @param ids The IDs of the data entries to delete
	 */
	async deleteMultiple(ids: string[]): Promise<void> {
		void (await Promise.all(ids.map((id) => this.delete(id))));
	}

	/**
	 * Advanced deletion handler which supports delete all
	 * @param req The deletion request
	 * @protected
	 */
	public deleteAdvanced?: (req: AdvancedDeleteRequest) => Promise<void>;

	/**
	 * DataGrid exporters supported by this backend connector
	 */
	public dataGridExporters?: IDataGridExporter<unknown>[];
}

export default Connector;
