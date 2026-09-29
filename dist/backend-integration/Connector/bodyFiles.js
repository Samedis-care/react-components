import isPlainObject from "../../utils/isPlainObject";
import fileToData from "../../utils/fileToData";
/**
 * Does the request body carry a Blob anywhere?
 * @param value The body, or a part of it
 */
export const containsBlob = (value) => {
    if (value instanceof Blob)
        return true;
    if (Array.isArray(value))
        return value.some(containsBlob);
    if (isPlainObject(value))
        return Object.values(value).some(containsBlob);
    return false;
};
/**
 * Replaces every Blob in the request body by a data URI, for a body sent as JSON
 * @param value The body, or a part of it
 * @returns A copy of the body, or the body itself if it carries no Blob
 * @remarks A File keeps its name as the data URI's `name` parameter
 */
export const blobsToDataUris = async (value) => {
    if (value instanceof Blob)
        return fileToData(value, value instanceof File);
    if (!containsBlob(value))
        return value;
    if (Array.isArray(value))
        return Promise.all(value.map(blobsToDataUris));
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, entry]) => [key, await blobsToDataUris(entry)])));
};
