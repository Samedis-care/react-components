import { Connector } from "../../../backend-integration/Connector";
import { ModelFieldName } from "../../../backend-integration/Model";
import { ResponseMeta } from "../../../backend-integration/Connector/Connector";
import {
	DataGridAdditionalFilters,
	DataGridSortSetting,
	IDataGridFieldFilter,
	IDataGridLoadDataParameters,
} from "../../../standalone/DataGrid";
import JsonApiClient, {
	GetParams,
} from "../../../backend-integration/Connector/JsonApiClient";
import AuthMode from "../../../backend-integration/Connector/AuthMode";

interface PotentialErrorResponse {
	meta?: {
		msg?: {
			success?: boolean;
			error?: string;
			message?: string;
		};
	};
}

interface DataResponse {
	data: {
		attributes: Record<string, unknown>;
	};
}

interface IndexResponse {
	data: {
		id: string;
		type: string;
		attributes: Record<string, unknown>;
	}[];
	meta: {
		total: number;
	};
}

interface BackendSort {
	property: string;
	direction: "ASC" | "DESC";
}

class TestConnector<KeyT extends ModelFieldName> extends Connector<KeyT> {
	apiBase: string;
	client: JsonApiClient;

	constructor(apiBase: string) {
		super();

		this.apiBase = apiBase;
		this.client = new JsonApiClient(this.handleAuth, this.processResponse);
	}

	handleAuth = (): string => {
		if (!localStorage.dataGridAuth) {
			localStorage.dataGridAuth = prompt("Enter your authentication");
		}
		if (!localStorage.dataGridAuth) {
			throw new Error("Invalid Authentication!");
		}
		return localStorage.dataGridAuth as string;
	};

	processResponse = async (
		response: Response,
		responseData: unknown,
		method: string,
		url: string,
		args: GetParams,
		body: unknown | null,
		auth: AuthMode
	): Promise<unknown> => {
		const rsp = responseData as PotentialErrorResponse;

		const success = rsp.meta?.msg?.success;
		const error = rsp.meta?.msg?.error;
		const message = rsp.meta?.msg?.message;
		if (!success) {
			if (error === "token_invalid" || error === "token_expired") {
				if (auth === AuthMode.Off) {
					throw new Error("Authentication is needed, but wasn't specified");
				}
				delete localStorage.dataGridAuth;
				// retry
				return this.client.http(method, url, args, body, auth);
			}
			throw new Error(message || error || "Invalid response");
		}

		return responseData;
	};

	convertSort = (sort: DataGridSortSetting): BackendSort => ({
		property: sort.field,
		direction: sort.direction < 0 ? "DESC" : "ASC",
	});

	getIndexParams(
		page: number,
		rows: number,
		sort: DataGridSortSetting[],
		quickFilter: string,
		gridFilter: IDataGridFieldFilter,
		additionalFilters: DataGridAdditionalFilters,
		format?: string,
		extraParams?: Record<string, unknown>
	): Record<string, unknown> {
		if (!format) format = "";
		if (!extraParams) extraParams = {};

		return Object.assign(
			{
				"page[number]": page,
				"page[limit]": rows,
				sort: sort.map(this.convertSort),
				quickfilter: quickFilter,
				gridfilter: gridFilter,
				additionalFilters: additionalFilters,
			},
			extraParams
		);
	}

	async index(
		params: Partial<IDataGridLoadDataParameters> | undefined
	): Promise<[Record<KeyT, unknown>[], ResponseMeta]> {
		// load reasonable defaults if nothing is set
		if (!params) params = {};
		if (!params.page) params.page = 1;
		if (!params.rows) params.rows = 25;
		if (!params.sort) params.sort = [];
		if (!params.quickFilter) params.quickFilter = "";
		if (!params.fieldFilter) params.fieldFilter = {};
		if (!params.additionalFilters) params.additionalFilters = {};

		const indexParams = this.getIndexParams(
			params.page,
			params.rows,
			params.sort,
			params.quickFilter,
			params.fieldFilter,
			params.additionalFilters
		);

		const resp = await this.client.get<IndexResponse>(
			this.apiBase,
			indexParams
		);

		return [
			resp.data.map((entry) => entry.attributes),
			{
				totalRows: resp.meta.total,
			},
		];
	}

	async create(data: Record<string, unknown>): Promise<Record<KeyT, unknown>> {
		const resp = await this.client.post<DataResponse>(this.apiBase, null, data);
		return resp.data.attributes;
	}

	async read(id: string): Promise<Record<KeyT, unknown>> {
		const resp = await this.client.get<DataResponse>(
			`${this.apiBase}/${id}`,
			null
		);
		return resp.data.attributes;
	}

	async update(
		data: Record<ModelFieldName, unknown>
	): Promise<Record<KeyT, unknown>> {
		const resp = await this.client.put<DataResponse>(
			`${this.apiBase}/${data.id as string}`,
			null,
			data
		);
		return resp.data.attributes;
	}

	async delete(id: string): Promise<void> {
		return this.client.delete(`${this.apiBase}/${id}`, null);
	}

	async deleteMultiple(ids: string[]): Promise<void> {
		return this.client.delete(`${this.apiBase}/${ids.join(",")}`, null);
	}
}

export default TestConnector;
