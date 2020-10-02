import { ModelFieldName } from "../Model";

/**
 * A generic backend connector which provides a basic CRUD interface for data
 */
abstract class Connector<KeyT extends ModelFieldName> {
	/**
	 * Lists all available data entries
	 * @returns An array with all data entries
	 */
	abstract async index(): Promise<Record<KeyT, unknown>[]>;

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
}

export default Connector;
