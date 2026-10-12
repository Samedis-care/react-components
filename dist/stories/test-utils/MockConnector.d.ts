import Connector, { ResponseMeta } from "../../backend-integration/Connector/Connector";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import { ModelGetResponse, ModelUnknown } from "../../backend-integration/Model";
/**
 * A simple in-memory Connector for Storybook stories.
 * Stores data in a Map and supports index (with pagination/filtering/sorting),
 * create, read, update, and delete operations.
 */
declare class MockConnector extends Connector {
    private data;
    private nextId;
    constructor(initialData?: Record<string, unknown>[]);
    index(params?: Partial<IDataGridLoadDataParameters>): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;
    create(data: Record<string, unknown>): ModelGetResponse<ModelUnknown>;
    read(id: string): ModelGetResponse<ModelUnknown>;
    update(data: Record<string, unknown>): ModelGetResponse<ModelUnknown>;
    delete(id: string): void;
}
export default MockConnector;
