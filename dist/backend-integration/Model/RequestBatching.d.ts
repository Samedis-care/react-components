import Model, { ModelFieldName, PageVisibility } from "./Model";
declare class RequestBatching {
    /**
     * Time in milliseconds in which no new request shall be added to the batch for the batch to be processed (debounce timer)
     */
    static BATCH_DURATION: number;
    /**
     * Max delay in milliseconds of requests added to the batch. This timer forces the batch to be processed even if BATCH_DURATION would make it wait
     * => limits max delay/latency
     */
    static MAX_BATCH_TIME: number;
    /**
     * Max amount of requests in a single batch
     */
    static MAX_BATCH_REQUESTS: number;
    private static batchPromises;
    private static batchNonce;
    private static batchRequestIds;
    private static batchLastAdded;
    static get<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(id: string, model: Model<KeyT, VisibilityT, CustomT>): Promise<Record<string, unknown>>;
}
export default RequestBatching;
