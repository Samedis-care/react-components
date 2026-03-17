import Connector, { ResponseMeta } from "../../backend-integration/Connector/Connector";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import { ModelFieldName, ModelGetResponse, PageVisibility } from "../../backend-integration/Model";
/**
 * A simple in-memory Connector for Storybook stories.
 * Stores data in a Map and supports index (with pagination/filtering/sorting),
 * create, read, update, and delete operations.
 */
declare class MockConnector extends Connector<ModelFieldName, PageVisibility, any> {
    private data;
    private nextId;
    constructor(initialData?: Record<string, unknown>[]);
    index(params?: Partial<IDataGridLoadDataParameters>): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;
    create(data: Record<string, unknown>): ModelGetResponse<ModelFieldName>;
    read(id: string): ModelGetResponse<ModelFieldName>;
    update(data: Record<ModelFieldName, unknown>): ModelGetResponse<ModelFieldName>;
    delete(id: string): void;
}
export default MockConnector;
