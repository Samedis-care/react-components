/**
 * Deep clones data
 * @param item The data to clone
 * @returns The cloned object
 * @remarks Blobs (files included) and AbortSignals are kept as they are
 */
declare const deepClone: <T>(item: T) => T;
export default deepClone;
