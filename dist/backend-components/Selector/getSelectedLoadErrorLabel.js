/**
 * Whether the backend has no record with the requested id, or none the user may see
 * @param err The error loading the record raised
 * @remarks A batched load raises a RequestBatchingError for a record the batch did not
 *          return, an unbatched one the backend's 404.
 */
const isRecordMissing = (err) => err.name === "RequestBatchingError" ||
    (err.name === "BackendError" && err.status === 404);
/**
 * The label of a selected entry whose record failed to load
 * @param id The entry's id
 * @param err The error loading the record raised
 * @param onLoadError The owner's handler, which labels or drops the entry
 * @param t The library's translate function
 * @returns The label, or a falsy value to drop the entry. Without a handler the
 *          entry is labelled "Unknown entry" if the backend did not return its
 *          record, else "Error while fetching data".
 * @remarks The error itself goes to the console: its message is technical.
 */
const getSelectedLoadErrorLabel = (id, err, onLoadError, t) => {
    // eslint-disable-next-line no-console
    console.warn("[Components-Care] [Selector] Could not load selected record " + id + ":", err);
    if (onLoadError)
        return onLoadError(err);
    return t(isRecordMissing(err)
        ? "backend-components.selector.unknown-entry"
        : "backend-components.selector.loading-error");
};
export default getSelectedLoadErrorLabel;
