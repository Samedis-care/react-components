import { Connector } from "../../backend-integration/Connector";
import {
	ModelFieldName,
	ModelGetResponse,
	PageVisibility,
} from "../../backend-integration";
import { ResponseMeta } from "../../backend-integration";
import {
	DataGridAdditionalFilters,
	DataGridSortSetting,
	IDataGridFieldFilter,
	IDataGridLoadDataParameters,
} from "../../standalone/DataGrid/DataGrid";
import JsonApiClient, {
	GetParams,
} from "../../backend-integration/Connector/JsonApiClient";
import AuthMode from "../../backend-integration/Connector/AuthMode";

interface PotentialErrorResponse {
	meta?: {
		msg?: {
			success?: boolean;
			error?: string;
			message?: string;
		};
	};
}

interface DataResponse<KeyT extends ModelFieldName> {
	data: {
		attributes: Record<KeyT, unknown>;
	};
}

interface IndexResponse<KeyT extends ModelFieldName> {
	data: {
		id: string;
		type: string;
		attributes: Record<KeyT, unknown>;
	}[];
	meta: {
		total: number;
	};
}

interface BackendSort {
	property: string;
	direction: "ASC" | "DESC";
}

class BackendConnector<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Connector<KeyT, VisibilityT, CustomT> {
	client: JsonApiClient;

	constructor() {
		super();

		this.client = new JsonApiClient(this.handleAuth, this.processResponse);
	}

	getApiBase = (): string => {
		if (!localStorage.apiBase) {
			throw new Error(
				"Please set the API endpoint for the data grid story in dev tools: 'localStorage.apiBase = \"https://url/to/your/api\"'"
			);
		}
		return localStorage.apiBase as string;
	};

	handleAuth = (): string => {
		if (!localStorage.dataGridAuth) {
			throw new Error(
				"Please set your authentication in dev tools: 'localStorage.dataGridAuth = \"Authorization Header Value\"'"
			);
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
		extraParams?: Record<string, unknown>
	): Record<string, unknown> {
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
	): Promise<[Record<KeyT, unknown>[], ResponseMeta, unknown?]> {
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

		const resp = await this.client.get<IndexResponse<KeyT>>(
			this.getApiBase(),
			indexParams
		);

		return [
			resp.data.map((entry) => entry.attributes),
			{
				totalRows: resp.meta.total,
			},
			resp.meta,
		];
	}

	async create(data: Record<string, unknown>): Promise<ModelGetResponse<KeyT>> {
		const resp = await this.client.post<DataResponse<KeyT>>(
			this.getApiBase(),
			null,
			data
		);
		return [resp.data.attributes, {}];
	}

	async read(id: string): Promise<ModelGetResponse<KeyT>> {
		const resp = await this.client.get<DataResponse<KeyT>>(
			`${this.getApiBase()}/${id}`,
			null
		);
		return [resp.data.attributes, {}];
	}

	async update(
		data: Record<ModelFieldName, unknown>
	): Promise<ModelGetResponse<KeyT>> {
		const resp = await this.client.put<DataResponse<KeyT>>(
			`${this.getApiBase()}/${data.id as string}`,
			null,
			data
		);
		return [resp.data.attributes, {}];
	}

	async delete(id: string): Promise<void> {
		return this.client.delete(`${this.getApiBase()}/${id}`, null);
	}

	async deleteMultiple(ids: string[]): Promise<void> {
		return this.client.delete(`${this.getApiBase()}/${ids.join(",")}`, null);
	}
}

export default BackendConnector;
