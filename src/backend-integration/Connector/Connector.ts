import { ModelFieldName } from "../Model";

abstract class Connector<KeyT extends ModelFieldName> {
	abstract async index(): Promise<Record<KeyT, unknown>[]>;
	abstract async create(
		data: Record<string, unknown>
	): Promise<Record<KeyT, unknown>>;
	abstract async read(id: string): Promise<Record<KeyT, unknown>>;
	abstract async update(
		data: Record<ModelFieldName, unknown>
	): Promise<Record<KeyT, unknown>>;
	abstract async delete(id: string): Promise<void>;
}

export default Connector;
