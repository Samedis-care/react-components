class RequestBatchingError extends Error {
	/**
	 * A error raised by the request batching subsystem
	 * @param msg The message (human-readable)
	 */
	constructor(msg: string) {
		super(msg);
		this.name = "RequestBatchingError";
	}
}

export default RequestBatchingError;
