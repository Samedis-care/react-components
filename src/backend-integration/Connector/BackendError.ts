class BackendError extends Error {
	constructor(msg: string) {
		super(msg);
		this.name = "BackendError";
	}
}

export default BackendError;
