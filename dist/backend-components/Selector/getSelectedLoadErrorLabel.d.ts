import type { TFunction } from "i18next";
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
declare const getSelectedLoadErrorLabel: (id: string, err: Error, onLoadError: ((error: Error) => string | null) | undefined, t: TFunction) => string | null;
export default getSelectedLoadErrorLabel;
