/**
 * Does the request body carry a Blob anywhere?
 * @param value The body, or a part of it
 */
export declare const containsBlob: (value: unknown) => boolean;
/**
 * Replaces every Blob in the request body by a data URI, for a body sent as JSON
 * @param value The body, or a part of it
 * @returns A copy of the body, or the body itself if it carries no Blob
 * @remarks A File keeps its name as the data URI's `name` parameter
 */
export declare const blobsToDataUris: (value: unknown) => Promise<unknown>;
