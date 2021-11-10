import {
	AdvancedDeleteRequest,
	Connector,
	filterSortPaginate,
	Model,
	ModelData,
	ModelFieldName,
	ModelGetResponse,
	PageVisibility,
	ResponseMeta,
} from "../..";
import {
	DataGridRowData,
	IDataGridLoadDataParameters,
} from "../../standalone/DataGrid/DataGrid";

class LocalStorageConnector<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Connector<KeyT, VisibilityT, CustomT> {
	key: string;

	/**
	 * Creates a new local storage connector
	 * @param key The storage key
	 */
	constructor(key: string) {
		super();

		this.key = key;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async index(
		params?: Partial<IDataGridLoadDataParameters>,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<[Record<string, unknown>[], ResponseMeta]> {
		// eslint-disable-next-line no-console
		console.log("[CC] [LocalStorageConnector] index(", params, model, ")");

		if (!model && params?.fieldFilter) {
			throw new Error("Can't index with field filter: No model specified");
		}

		const db = this.getDB();
		const processed = filterSortPaginate(
			Object.values(db) as DataGridRowData[],
			Object.assign(
				{
					page: 1,
					rows: 25,
					sort: [],
					quickFilter: "",
					fieldFilter: {},
					additionalFilters: {},
				},
				params
			),
			model?.toDataGridColumnDefinition() ?? []
		);
		return [
			processed[0],
			{
				totalRows: Object.keys(db).length,
				filteredRows: processed[1],
			},
		];
	}

	create(data: Record<string, unknown>): ModelGetResponse<KeyT> {
		if ("id" in data && data.id) {
			throw new Error("Can't create: Creation request contains ID");
		}
		const db = this.getDB();
		// generate random ID
		const id = [...new Array<number>(16)]
			.map(() => Math.floor(Math.random() * 16).toString(16))
			.join("");

		data["id"] = id;
		db[id] = data;
		this.setDB(db);

		return [data as ModelData<KeyT>, {}];
	}

	read(id: string): ModelGetResponse<KeyT> {
		const db = this.getDB();
		if (!(id in db)) {
			throw new Error("Can't read: Record not found");
		}
		return [db[id], {}];
	}

	update(data: Record<ModelFieldName, unknown>): ModelGetResponse<KeyT> {
		const db = this.getDB();
		const id = data["id"] as string;
		if (!(id in db)) {
			throw new Error("Can't read: Record not found");
		}
		db[id] = data;
		this.setDB(db);
		return [data as ModelData<KeyT>, {}];
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async delete(id: string): Promise<void> {
		const db = this.getDB();
		if (!(id in db)) {
			throw new Error("Can't delete: Record not found");
		}
		delete db[id];
		this.setDB(db);
	}

	deleteAdvanced = async (
		req: AdvancedDeleteRequest,
		model?: Model<KeyT, VisibilityT, CustomT>
	): Promise<void> => {
		const [invert, ids, filter] = req;
		if (!invert) {
			// deleteMultiple may return undefined or a promise
			// eslint-disable-next-line @typescript-eslint/await-thenable
			await super.deleteMultiple(ids, model);
			return;
		}
		const toDelete = await this.index({
			page: 1,
			rows: Number.MAX_SAFE_INTEGER,
			sort: [],
			...filter,
		});
		const matchingIds = toDelete[0]
			.map((entry) => (entry as Record<"id", string>).id)
			.filter((id) => !ids.includes(id));
		return super.deleteMultiple(matchingIds, model);
	};

	private getDB(): Record<string, Record<string, unknown>> {
		const dataStr = localStorage.getItem(this.key);
		if (!dataStr) return {};
		try {
			return JSON.parse(dataStr) as Record<string, Record<string, unknown>>;
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(
				"[Components-Care] [LocalStorageConnector] Failed parsing data",
				e
			);
			return {};
		}
	}

	private setDB(data: Record<string, Record<string, unknown>>) {
		return localStorage.setItem(this.key, JSON.stringify(data));
	}
}

export default LocalStorageConnector;
