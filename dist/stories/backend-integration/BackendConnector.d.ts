import { Connector } from "../../backend-integration/Connector";
import { ModelFieldName, ModelGetResponse, PageVisibility } from "../../backend-integration";
import { ResponseMeta } from "../../backend-integration";
import { DataGridAdditionalFilters, DataGridSortSetting, IDataGridFieldFilter, IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import JsonApiClient, { GetParams } from "../../backend-integration/Connector/JsonApiClient";
import AuthMode from "../../backend-integration/Connector/AuthMode";
interface BackendSort {
    property: string;
    direction: "ASC" | "DESC";
}
declare class BackendConnector<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends Connector<KeyT, VisibilityT, CustomT> {
    client: JsonApiClient;
    constructor();
    getApiBase: () => string;
    handleAuth: () => string;
    processResponse: (response: Response, responseData: unknown, method: string, url: string, args: GetParams, body: unknown | null, auth: AuthMode) => Promise<unknown>;
    convertSort: (sort: DataGridSortSetting) => BackendSort;
    getIndexParams(page: number, rows: number, sort: DataGridSortSetting[], quickFilter: string, gridFilter: IDataGridFieldFilter, additionalFilters: DataGridAdditionalFilters, extraParams?: Record<string, unknown>): Record<string, unknown>;
    index(params: Partial<IDataGridLoadDataParameters> | undefined): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;
    create(data: Record<string, unknown>): Promise<ModelGetResponse<KeyT>>;
    read(id: string): Promise<ModelGetResponse<KeyT>>;
    update(data: Record<ModelFieldName, unknown>): Promise<ModelGetResponse<KeyT>>;
    delete(id: string): Promise<void>;
    deleteMultiple(ids: string[]): Promise<void>;
}
export default BackendConnector;
