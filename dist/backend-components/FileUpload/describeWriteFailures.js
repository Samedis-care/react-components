import i18n from "../../i18n";
/**
 * What a change of CrudFileUpload or CrudMultiImage could not write, in the user's
 * language: one sentence per failed write, naming the file and the reason
 * @param failures The writes that failed
 * @param nameOf The name of a failure's file or image, as the user knows it
 * @returns The sentences, e.g. "Could not upload a.pdf: File too large. Could not remove
 *          b.pdf: in use."
 */
const describeWriteFailures = (failures, nameOf) => failures
    .map((failure) => {
    const text = i18n.t(`backend-components.file-upload.write-failed.${failure.action}`, {
        name: nameOf(failure.entry),
        reason: failure.error.message || i18n.t("common.dialogs.error-title"),
    });
    // one sentence each, however the backend's reason ends
    return /[.!?…]$/.test(text) ? text : `${text}.`;
})
    .join(" ");
export default describeWriteFailures;
