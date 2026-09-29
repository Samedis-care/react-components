const blobIds = new WeakMap();
let nextBlobId = 0;
const getBlobId = (blob) => {
    let id = blobIds.get(blob);
    if (id === undefined) {
        id = nextBlobId++;
        blobIds.set(blob, id);
    }
    return id;
};
/**
 * JSON of a value, for telling whether two values are the same
 * @param value The value
 * @returns The JSON, in which a Blob (a File included) stands for itself
 * @remarks Plain JSON writes every Blob as `{}`, so one picked file looks like any other.
 *          Here each Blob gets an id of its own, and the bytes are never read.
 */
const toComparisonJson = (value) => JSON.stringify(value, (_key, entry) => entry instanceof Blob ? { $blob: getBlobId(entry) } : entry);
export default toComparisonJson;
