class NetworkError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "NetworkError";
    }
}
export default NetworkError;
