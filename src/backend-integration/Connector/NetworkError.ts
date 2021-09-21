class NetworkError extends Error {
	constructor(msg: string) {
		super(msg);
		this.name = "NetworkError";
	}
}

export default NetworkError;
