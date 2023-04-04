import { AdvancedDeleteRequest, Connector, Model, ModelFieldName, ModelGetResponse, PageVisibility, ResponseMeta } from "../..";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
declare class LocalStorageConnector<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends Connector<KeyT, VisibilityT, CustomT> {
    key: string;
    /**
     * Creates a new local storage connector
     * @param key The storage key
     */
    constructor(key: string);
    index(params?: Partial<IDataGridLoadDataParameters>, model?: Model<KeyT, VisibilityT, CustomT>): Promise<[Record<string, unknown>[], ResponseMeta]>;
    create(data: Record<string, unknown>): ModelGetResponse<KeyT>;
    read(id: string): ModelGetResponse<KeyT>;
    update(data: Record<ModelFieldName, unknown>): ModelGetResponse<KeyT>;
    delete(id: string): Promise<void>;
    deleteAdvanced: (req: AdvancedDeleteRequest, model?: Model<KeyT, VisibilityT, CustomT> | undefined) => Promise<void>;
    private getDB;
    private setDB;
}
export default LocalStorageConnector;
