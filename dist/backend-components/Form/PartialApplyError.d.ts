/**
 * A write of a CRUD control's change that did not go through
 */
export interface PartialApplyFailure<EntryT = unknown> {
    /**
     * What the write was for: the selector entry, file or image
     */
    entry: EntryT;
    /**
     * What was attempted for it. `read`: the write went through, but its result could
     * not be turned into an entry (CrudMultiSelect's and CrudMultiSelectWithGroups'
     * `deserialize` failed after a create); the control lists `entry` as it was sent.
     */
    action: "create" | "update" | "delete" | "read";
    /**
     * Why it failed
     */
    error: Error;
}
export declare const isPartialApplyError: (e: Error) => e is PartialApplyError;
/**
 * The writes of a CRUD control's change that did not go through, or whose result could
 * not be read (action `read`). Every other write of the same change did, and the
 * control shows it.
 * @remarks Handed to `errorComponent` by CrudMultiSelect, CrudMultiSelectWithGroups,
 *          CrudFileUpload and CrudMultiImage. The message says what failed and why, as
 *          the control words it; `failures` lists the writes for a component that wants
 *          to show them its own way.
 */
export default class PartialApplyError<EntryT = unknown> extends Error {
    failures: PartialApplyFailure<EntryT>[];
    /**
     * @param message What failed and why, human readable
     * @param failures The writes that did not go through
     */
    constructor(message: string, failures: PartialApplyFailure<EntryT>[]);
}
