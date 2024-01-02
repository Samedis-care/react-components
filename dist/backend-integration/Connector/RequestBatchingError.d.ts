declare class RequestBatchingError extends Error {
    /**
     * A error raised by the request batching subsystem
     * @param msg The message (human-readable)
     */
    constructor(msg: string);
}
export default RequestBatchingError;
