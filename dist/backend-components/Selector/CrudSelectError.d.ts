import { BaseSelectorData } from "../../standalone";
export interface CrudSelectFailure<DataT extends BaseSelectorData> {
    /**
     * The entry whose write did not go through
     */
    entry: DataT;
    /**
     * What was attempted for it
     */
    action: "create" | "update" | "delete";
    /**
     * Why it failed
     */
    error: Error;
}
export declare const isCrudSelectError: (e: Error) => e is CrudSelectError;
/**
 * The writes of a selection change which did not go through.
 * Every other write of the same change did, and is reflected in the selection.
 */
export default class CrudSelectError<DataT extends BaseSelectorData = BaseSelectorData> extends Error {
    failures: CrudSelectFailure<DataT>[];
    constructor(failures: CrudSelectFailure<DataT>[]);
}
