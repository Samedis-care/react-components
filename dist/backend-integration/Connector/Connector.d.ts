import { AdvancedDeleteRequest, ModelFieldName, ModelGetResponse, ModelUnknown } from "../Model";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import { IDataGridExporter } from "../../standalone/DataGrid/Header";
export interface ResponseMeta {
    /**
     * The total amount of rows
     */
    totalRows: number;
    /**
     * The amount of rows being shown (if a filter is set)
     */
    filteredRows?: number;
}
export type ConnectorIndex2Params = Partial<Omit<IDataGridLoadDataParameters, "page" | "rows">> & {
    offset: number;
    rows: number;
};
/**
 * A generic backend connector which provides a basic CRUD interface for data
 */
declare abstract class Connector {
    /**
     * Lists all available data entries
     * @param params Filter, Sorting and Pagination parameters. Model.index passes a copy, so changes to them stay with the connector
     * @param model The model requesting the data (if any)
     * @returns Array An array with all data entries as well as some meta data.
     * 								The third element in the array is user-defined
     */
    abstract index(params?: Partial<IDataGridLoadDataParameters>, model?: ModelUnknown): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;
    /**
     * Index function, which works with offsets, rather than pages
     * @param params Filter, Sorting and offset parameters. Model.index2 passes a copy, so changes to them stay with the connector
     * @param model The model requesting the data (if any)
     * @see index
     * @remarks This should be implemented by application developers if possible, it allows for increased efficiency.
     *          This function should be avoided if you are developing Components-Care components, prefer the normal index function.
     *          This function is poly-filled if not implemented by application developer, which is less efficient
     *          and drops the user-defined third return value, as the polyfill merges multiple calls to index function into one.
     */
    index2(params: ConnectorIndex2Params, model?: ModelUnknown): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;
    /**
     * Creates a new data entry with the given data
     * @param data The initial data for the entry
     * @param model The model performing the request
     * @returns The full newly created data entry
     */
    abstract create(data: Record<string, unknown>, model?: ModelUnknown): Promise<ModelGetResponse<ModelUnknown>> | ModelGetResponse<ModelUnknown>;
    /**
     * Loads an existing data entry
     * @param id The ID of the existing data entry
     * @param model The model performing the request
     * @returns The loaded data entry
     */
    abstract read(id: string, model?: ModelUnknown): Promise<ModelGetResponse<ModelUnknown>> | ModelGetResponse<ModelUnknown>;
    /**
     * Updates an already existing data entry
     * @param data The given data including the ID of the data entry
     * @param model The model performing the request
     * @returns The modified data entry
     */
    abstract update(data: Record<ModelFieldName, unknown>, model?: ModelUnknown): Promise<ModelGetResponse<ModelUnknown>> | ModelGetResponse<ModelUnknown>;
    /**
     * Deletes a specific data entry
     * @param id The ID of the data entry to delete
     * @param model The model performing the request
     */
    abstract delete(id: string, model?: ModelUnknown): Promise<void> | void;
    /**
     * Deletes multiple data entries at once. Should be overwritten if implemented by your backend.
     * @param ids The IDs of the data entries to delete
     * @param model The model performing the request
     * @throws PartialDeleteError if some of the entries were deleted and others were not.
     *         An override throws it too where the backend says which entries it could not
     *         delete: any other error leaves the caller to assume none was deleted.
     * @remarks The default deletes each entry through delete and waits for all of them.
     *          If every delete fails, it rejects with the error of the first.
     */
    deleteMultiple(ids: string[], model?: ModelUnknown): Promise<void> | void;
    /**
     * Advanced deletion handler which supports delete all
     * @param req The deletion request
     * @protected
     */
    deleteAdvanced?: (req: AdvancedDeleteRequest, model?: ModelUnknown) => Promise<void> | void;
    /**
     * DataGrid exporters supported by this backend connector
     */
    dataGridExporters?: IDataGridExporter<unknown>[];
}
export default Connector;
