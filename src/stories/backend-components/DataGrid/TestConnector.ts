/* eslint-disable */
import { Connector } from "../../../backend-integration/Connector";
import { ModelFieldName } from "../../../backend-integration/Model";
import { ResponseMeta } from "../../../backend-integration/Connector/Connector";
import { IDataGridLoadDataParameters } from "../../../standalone/DataGrid";
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

class TestConnector<KeyT extends ModelFieldName> extends Connector<KeyT> {
	apiBase: string;
	client: JsonApiClient;

	constructor(apiBase: string) {
		super();

		this.apiBase = apiBase;
		this.client = new JsonApiClient(this.handleAuth, this.processResponse);
	}

	handleAuth() {
		localStorage.dataGridAuth ||= prompt("Enter your authentication");
		if (!localStorage.dataGridAuth) {
			throw new Error("Invalid Authentication!");
		}
		return localStorage.dataGridAuth;
	}

	async processResponse(
		response: Response,
		responseData: unknown,
		method: string,
		url: string,
		args: GetParams,
		body: unknown | null,
		auth: AuthMode
	): Promise<unknown> {
		const rsp = responseData as PotentialErrorResponse;

		let success = rsp.meta?.msg?.success;
		let error = rsp.meta?.msg?.error;
		let message = rsp.meta?.msg?.message;
		if (!success) {
			if (error === "token_invalid" || error === "token_expired") {
				if (auth === AuthMode.Off) {
					debugger;
					throw new Error("Authentication is needed, but wasn't specified");
				}
				delete localStorage.dataGridAuth;
				// retry
				return this.client.http(method, url, args, body, auth);
			}
			throw new Error(message || error || "Invalid response");
		}

		return responseData;
	}

	async create(data: Record<string, unknown>): Promise<Record<KeyT, unknown>> {
		const resp = await this.client.post<DataResponse>(this.apiBase, null, data);
		return resp.data.attributes;
	}

	async delete(id: string): Promise<void> {
		throw new Error("Not implemented");
	}

	async index(
		responseMeta: ResponseMeta,
		params: Partial<IDataGridLoadDataParameters> | undefined
	): Promise<Record<KeyT, unknown>[]> {
		throw new Error("Not implemented");
	}

	async read(id: string): Promise<Record<KeyT, unknown>> {
		const resp = await this.client.get<DataResponse>(
			this.apiBase + "/" + id,
			null
		);
		return resp.data.attributes;
	}

	async update(
		data: Record<ModelFieldName, unknown>
	): Promise<Record<KeyT, unknown>> {
		const resp = await this.client.put<DataResponse>(
			this.apiBase + "/" + data.id,
			null,
			data
		);
		return resp.data.attributes;
	}
}

export default TestConnector;
