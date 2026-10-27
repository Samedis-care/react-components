/**
 * Thrown by `Connector.deleteMultiple` when some of the records were deleted and others
 * were not
 * @remarks Any other error from deleteMultiple leaves open which records were deleted, so
 *          a caller has to assume none was. A connector that overrides deleteMultiple
 *          must throw this if its backend can delete some of the records of one call
 *          and refuse others.
 */
declare class PartialDeleteError extends Error {
    /**
     * The ids that were not deleted. Every other id of the call was.
     */
    failedIds: string[];
    /**
     * A deleteMultiple that deleted only some of the records
     * @param msg The message (human readable)
     * @param failedIds The ids that were not deleted
     * @param cause What the deletes failed with, e.g. the error of the first
     */
    constructor(msg: string, failedIds: string[], cause?: unknown);
}
export default PartialDeleteError;
