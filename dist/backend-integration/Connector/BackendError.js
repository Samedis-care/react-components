class BackendError extends Error {
    code;
    meta;
    /**
     * A error raised by backend
     * @param msg The message (human readable)
     * @param code Optional unique identifier for error
     * @param meta Optional custom meta data
     */
    constructor(msg, code, meta) {
        super(msg);
        this.name = "BackendError";
        this.code = code;
        this.meta = meta;
    }
}
export default BackendError;
