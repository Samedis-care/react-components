/**
 * Whether `e` is a PartialApplyError, also one from another copy of the library (checks the
 * name, `CcPartialApplyError`, not the class)
 * @param e The error to check
 * @returns true for a PartialApplyError
 */
export const isPartialApplyError = (e) => {
    return e.name === "CcPartialApplyError";
};
/**
 * The writes of a CRUD control's change that did not go through, or whose result could
 * not be read (action `read`). Every other write of the same change did, and the
 * control shows it.
 * @remarks Handed to `errorComponent` by CrudMultiSelect, CrudMultiSelectWithGroups,
 *          CrudFileUpload and CrudMultiImage. The message says what failed and why, as
 *          the control words it; `failures` lists the writes for a component that wants
 *          to show them its own way. While one of them is mounted on a LazyConnector, it
 *          is also what the connector's `workQueue`, and with it a Form's save, rejects
 *          with for the queued writes the backend refused. Its name is
 *          `CcErrorNames.PartialApplyError`; the default error-reporting policy reports it
 *          only if one of its failures' errors would be reported on its own (see
 *          defaultShouldReportError).
 */
export default class PartialApplyError extends Error {
    failures;
    /**
     * @param message What failed and why, human readable
     * @param failures The writes that did not go through
     */
    constructor(message, failures) {
        super(message);
        this.name = "CcPartialApplyError";
        this.failures = failures;
    }
}
