import { sleep } from "../../utils";
class RequestBatching {
    /**
     * Time in milliseconds in which no new request shall be added to the batch for the batch to be processed (debounce timer)
     */
    static BATCH_DURATION = 10;
    /**
     * Max delay in milliseconds of requests added to the batch. This timer forces the batch to be processed even if BATCH_DURATION would make it wait
     * => limits max delay/latency
     */
    static MAX_BATCH_TIME = 50;
    /**
     * Max amount of requests in a single batch
     */
    static MAX_BATCH_REQUESTS = 100;
    static batchPromises = {};
    static batchNonce = {};
    static batchRequestIds = {};
    static batchLastAdded = {};
    static async get(id, model) {
        const batchKey = JSON.stringify(model.getReactQueryKey(null, true));
        let promise;
        if (batchKey in this.batchPromises &&
            this.batchRequestIds[batchKey].length < this.MAX_BATCH_REQUESTS) {
            this.batchRequestIds[batchKey].push(id);
            this.batchLastAdded[batchKey] = Date.now();
            promise = this.batchPromises[batchKey];
        }
        else {
            // keep local references to the data we just created because the global vars might be overridden
            const batchRequests = (this.batchRequestIds[batchKey] = [id]);
            const batchStart = (this.batchLastAdded[batchKey] = Date.now());
            const batchNonce = (this.batchNonce[batchKey] = `${Date.now().toString()}-${Math.random()}`);
            this.batchPromises[batchKey] = promise = (async () => {
                // wait for the batch to ready
                while (batchRequests.length < this.MAX_BATCH_REQUESTS) {
                    const now = Date.now();
                    const maxBatchTimeWait = batchStart + this.MAX_BATCH_TIME - now;
                    const nextRequestTimeWait = this.batchLastAdded[batchKey] + this.BATCH_DURATION - now;
                    const minWait = Math.min(maxBatchTimeWait, nextRequestTimeWait);
                    if (minWait <= 0)
                        break; // something timed out, we're ready
                    await sleep(minWait);
                }
                // if our nonce still matches there is no new instance using our key, so we clean up after us
                if (this.batchNonce[batchKey] === batchNonce) {
                    delete this.batchPromises[batchKey];
                    delete this.batchNonce[batchKey];
                    delete this.batchRequestIds[batchKey];
                    delete this.batchLastAdded[batchKey];
                }
                // execute batch
                return model.fetchAll({
                    fieldFilter: {
                        id: {
                            type: "inSet",
                            value1: batchRequests.join(","),
                            value2: "",
                        },
                    },
                });
            })();
        }
        const result = await promise;
        const record = result[0].find((record) => record.id === id);
        if (!record)
            throw new Error("[Components-Care] [RequestBatching] Requested record not returned by backend");
        return record;
    }
}
export default RequestBatching;