class BackendError extends Error {
	code: string | undefined;
	meta: unknown | undefined;

	/**
	 * A error raised by backend
	 * @param msg The message (human readable)
	 * @param code Optional unique identifier for error
	 * @param meta Optional custom meta data
	 */
	constructor(msg: string, code?: string, meta?: unknown) {
		super(msg);
		this.name = "BackendError";
		this.code = code;
		this.meta = meta;
	}
}

export default BackendError;
