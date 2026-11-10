import { ModelUnknown, PageVisibility } from "./Model";
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
    /**
     * Loads a record through a batched index request
     * @param id The record id
     * @param model The model
     * @param visibility The visibility to deserialize the record with: "edit" where the batch
     *                   stands in for a show (the model's enableRequestBatching), "overview"
     *                   where the caller asked for a batch
     * @returns The deserialized record
     * @remarks Gets of both visibilities share one request: the batch holds the records as the
     *          connector returns them, and each get deserializes its own.
     */
    static get(id: string, model: ModelUnknown, visibility?: keyof PageVisibility): Promise<Record<string, unknown>>;
}
export default RequestBatching;
