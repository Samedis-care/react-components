/**
 * JSON of a value, for telling whether two values are the same
 * @param value The value
 * @returns The JSON, in which a Blob (a File included) stands for itself
 * @remarks Plain JSON writes every Blob as `{}`, so one picked file looks like any other.
 *          Here each Blob gets an id of its own, and the bytes are never read.
 */
declare const toComparisonJson: (value: unknown) => string;
export default toComparisonJson;
