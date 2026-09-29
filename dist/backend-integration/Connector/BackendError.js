class BackendError extends Error {
    code;
    meta;
    /**
     * The HTTP status of the response the error came from
     */
    status;
    /**
     * The headers of the response the error came from, e.g. for its Retry-After
     */
    headers;
    /**
     * A error raised by backend
     * @param msg The message (human readable)
     * @param code Optional unique identifier for error
     * @param meta Optional custom meta data
     * @param response Optional response the error came from, for its status and headers
     * @remarks JsonApiClient passes the response for a response that isn't JSON (e.g. a
     *          proxy's error page), which reaches no response processor. A response
     *          processor that raises a BackendError passes it on if it wants callers to
     *          have it.
     */
    constructor(msg, code, meta, response) {
        super(msg);
        this.name = "BackendError";
        this.code = code;
        this.meta = meta;
        this.status = response?.status;
        this.headers = response?.headers;
    }
}
export default BackendError;
