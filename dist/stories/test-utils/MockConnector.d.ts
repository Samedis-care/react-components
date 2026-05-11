import Connector, { ResponseMeta } from "../../backend-integration/Connector/Connector";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import { ModelFieldName, ModelGetResponse, PageVisibility } from "../../backend-integration/Model";
/**
 * A simple in-memory Connector for Storybook stories.
 * Stores data in a Map and supports index (with pagination/filtering/sorting),
 * create, read, update, and delete operations.
 */
declare class MockConnector<KeyT extends ModelFieldName = ModelFieldName, VisibilityT extends PageVisibility = PageVisibility, CustomT = null> extends Connector<KeyT, VisibilityT, CustomT> {
    private data;
    private nextId;
    constructor(initialData?: Record<string, unknown>[]);
    index(params?: Partial<IDataGridLoadDataParameters>): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;
    create(data: Record<string, unknown>): ModelGetResponse<KeyT>;
    read(id: string): ModelGetResponse<KeyT>;
    update(data: Record<KeyT, unknown>): ModelGetResponse<KeyT>;
    delete(id: string): void;
}
export default MockConnector;
