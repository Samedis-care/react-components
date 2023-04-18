declare class BackendError extends Error {
    code: string | undefined;
    /**
     * A error raised by backend
     * @param msg The message (human readable)
     * @param code Optional unique identifier for error
     */
    constructor(msg: string, code?: string);
}
export default BackendError;
