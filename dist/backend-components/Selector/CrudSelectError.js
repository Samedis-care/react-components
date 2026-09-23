export const isCrudSelectError = (e) => {
    return e.name === "CcCrudSelectError";
};
const labelOf = (entry) => typeof entry.label === "string" ? entry.label : entry.label[0];
/**
 * The writes of a selection change which did not go through.
 * Every other write of the same change did, and is reflected in the selection.
 */
export default class CrudSelectError extends Error {
    failures;
    constructor(failures) {
        super(failures
            .map((failure) => `${labelOf(failure.entry)}: ${failure.error.message}`)
            .join("; "));
        this.name = "CcCrudSelectError";
        this.failures = failures;
    }
}
