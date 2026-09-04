import Model, { AdvancedDeleteRequest, ModelFieldName, ModelGetResponse, PageVisibility } from "../../backend-integration/Model/Model";
import type { IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import Connector, { ResponseMeta } from "./Connector";
import ApiConnector from "./ApiConnector";
interface QueuedFunction {
    type: "create" | "update" | "delete";
    id: string | null;
    func: () => unknown;
    result: ModelGetResponse<string> | null;
    /**
     * For a delete: the ids it covers
     * @remarks Separate from id, which joins them for display, so that a single id can
     *          be looked up and cancelled without parsing it back apart
     */
    deleteIds?: string[];
    /**
     * For a delete covering more than one id: re-creates the request for a subset of them
     * @remarks Closes over the model, which the queue does not otherwise retain, so that
     *          cancelling one id can keep the request for the others. Never called with
     *          an empty list — an entry with nothing left to delete is dropped instead.
     */
    rebuildDelete?: (ids: string[]) => () => unknown;
}
/**
 * A queued write operation's kind
 */
export type QueuedOperation = QueuedFunction["type"];
type QueueChangeHandler = (queue: QueuedFunction[]) => void;
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
    private queueListeners;
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
    handleAdvancedDelete: (req: AdvancedDeleteRequest, model?: Model<KeyT, VisibilityT, CustomT>) => void;
    /**
     * The write operation queued for a record, if any
     * @param id The record id — potentially a fake one. A queue only exists before
     *           workQueue has run, and a record created client side has no real id until
     *           then, so a caller holding an id from this side of a submit may have either.
     * @remarks Lets a caller tell a record that only exists in the queue from one that
     *          is already on the server, which reads alone cannot: index and read serve
     *          queued records as if they had been written.
     */
    getQueuedOperation(id: string): QueuedOperation | null;
    /**
     * Drops the queued write operation for a record, undoing it
     * @param id The record id — potentially a fake one, see getQueuedOperation
     * @returns Was anything dropped?
     * @remarks A delete covering several records keeps the request for the ones that
     *          were not cancelled. Has no effect once workQueue has run.
     */
    cancelQueuedOperation(id: string): boolean;
    /**
     * Subscribes to every change of the queue, including it being emptied by workQueue
     * @param listener Called with the new queue
     * @returns Unsubscribe
     * @remarks Separate from setQueueChangeHandler, which is a single slot owned by
     *          useLazyCrudConnector. Anything rendering from the queue needs this: the
     *          queue is not React state, so without it a component keeps showing the
     *          pending state of writes that have since been sent.
     */
    addQueueChangeListener(listener: QueueChangeHandler): () => void;
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
