import { AdvancedDeleteRequest, Model, ModelFieldName, ModelGetResponse, PageVisibility } from "../..";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import Connector, { ResponseMeta } from "./Connector";
import ApiConnector from "./ApiConnector";
interface QueuedFunction {
    type: "create" | "update" | "delete";
    id: string | null;
    func: () => unknown;
    result: ModelGetResponse<string> | null;
}
declare type QueueChangeHandler = (queue: QueuedFunction[]) => void;
export declare enum IndexEnhancementLevel {
    /**
     * Pass though index call to backend
     */
    None = 0,
    /**
     * Pass though index call to backend, append new records and changed records in result
     */
    Basic = 1
}
/**
 * Forwards all read calls (index, read) to the real connector directly but queues all writing calls (create, update, delete) which can be fired at once
 * @remarks Does not support relations, enhances read/index calls with locally updated data
 */
declare class LazyConnector<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends Connector<KeyT, VisibilityT, CustomT> {
    realConnector: ApiConnector<KeyT, VisibilityT, CustomT>;
    fakeReads: boolean;
    indexEnhancement: IndexEnhancementLevel;
    private queue;
    private onQueueChange?;
    private readonly FAKE_ID_PREFIX;
    private fakeIdCounter;
    private fakeIdMapping;
    private fakeIdMappingRev;
    constructor(connector: ApiConnector<KeyT, VisibilityT, CustomT>, fakeReads: boolean, onQueueChange?: QueueChangeHandler);
    create(data: Record<string, unknown>, model: Model<KeyT, VisibilityT, CustomT> | undefined): ModelGetResponse<KeyT>;
    delete(id: string, model: Model<KeyT, VisibilityT, CustomT> | undefined): void;
    index(params: Partial<IDataGridLoadDataParameters> | undefined, model: Model<KeyT, VisibilityT, CustomT> | undefined): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]>;
    read(id: string, model: Model<KeyT, VisibilityT, CustomT> | undefined): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT>;
    update(data: Record<ModelFieldName, unknown>, model: Model<KeyT, VisibilityT, CustomT> | undefined): Promise<ModelGetResponse<KeyT>> | ModelGetResponse<KeyT>;
    deleteMultiple(ids: string[], model?: Model<KeyT, VisibilityT, CustomT>): void;
    handleAdvancedDelete: (req: AdvancedDeleteRequest, model?: Model<KeyT, VisibilityT, CustomT> | undefined) => void;
    private onAfterOperation;
    workQueue: () => Promise<void>;
    /**
     * Maps a potentially fake ID to a real ID
     * @param id The ID
     * @remarks Only works after workQueue has been called
     */
    mapId(id: string): string;
    /**
     * Maps a potentially real ID to a fake ID
     * @param id The ID
     */
    unmapId(id: string): string;
    /**
     * Is the work queue empty?
     */
    isQueueEmpty(): boolean;
    /**
     * Set a new queue change handler
     * @param newHandler The new handler
     */
    setQueueChangeHandler(newHandler: null | QueueChangeHandler): void;
}
export default LazyConnector;
