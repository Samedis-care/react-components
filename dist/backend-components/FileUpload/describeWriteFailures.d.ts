import { PartialApplyFailure } from "../Form/PartialApplyError";
/**
 * What a change of CrudFileUpload or CrudMultiImage could not write, in the user's
 * language: one sentence per failed write, naming the file and the reason
 * @param failures The writes that failed
 * @param nameOf The name of a failure's file or image, as the user knows it
 * @returns The sentences, e.g. "Could not upload a.pdf: File too large. Could not remove
 *          b.pdf: in use."
 */
declare const describeWriteFailures: <EntryT>(failures: PartialApplyFailure<EntryT>[], nameOf: (entry: EntryT) => string) => string;
export default describeWriteFailures;
