import JsonApiClient from "./JsonApiClient";
import dataToFile from "../../utils/dataToFile";
import isPlainObject from "../../utils/isPlainObject";

type FormValue = string | Blob;

/**
 * Is the value a file: a Blob, or a data URI standing for one?
 * @remarks A data URI still counts as a file, so a body built with fileToData, or
 *          stored before files were kept as Blobs, still uploads its files as files
 */
const isFile = (value: unknown): boolean =>
	value instanceof Blob ||
	(typeof value === "string" && value.startsWith("data:"));

const containsFile = (value: unknown): boolean => {
	if (isFile(value)) return true;
	if (Array.isArray(value)) return value.some(containsFile);
	if (isPlainObject(value)) return Object.values(value).some(containsFile);
	return false;
};

/**
 * Can Rails' multipart keys express the value without losing anything?
 * @remarks An array element that is an object cannot be told apart from its neighbours
 *          once it is flattened into `key[][field]` keys: Rack starts a new element only
 *          when a field repeats, so elements with optional fields merge. A body with
 *          such an array is sent as JSON instead. Files are the exception, they are
 *          single values.
 */
const isMultipartSafe = (value: unknown): boolean => {
	if (Array.isArray(value))
		return value.every(
			(entry) => entry instanceof Blob || typeof entry !== "object",
		);
	if (isPlainObject(value)) return Object.values(value).every(isMultipartSafe);
	return true;
};

const toFormValue = (value: unknown): FormValue => {
	if (value instanceof Blob) return value;
	if (typeof value === "number") return value.toString();
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value !== "string") {
		// eslint-disable-next-line no-console
		console.log(
			"[Components-Care] [RailsApiClient] [toFormValue] unsupported data",
			value,
		);
		throw new Error("unsupported data " + JSON.stringify(value));
	}
	if (value.startsWith("data:")) return dataToFile(value);
	return value;
};

/**
 * Flattens a value into Rails-style multipart keys: `data[image]`, `data[tags][]`
 * @param entries The entries to append to
 * @param key The key of the value
 * @param value The value
 * @remarks Multipart has no null, so a null or undefined value leaves its key out, and
 *          so does an empty array or object
 */
const appendRails = (
	entries: [string, FormValue][],
	key: string,
	value: unknown,
) => {
	if (value == null) return;
	if (Array.isArray(value)) {
		value.forEach((entry) => entries.push([key + "[]", toFormValue(entry)]));
	} else if (isPlainObject(value)) {
		Object.entries(value).forEach(([nestedKey, nestedValue]) =>
			appendRails(entries, `${key}[${nestedKey}]`, nestedValue),
		);
	} else if (
		!(value instanceof Blob) &&
		typeof value === "object" &&
		typeof (value as { toJSON?: unknown }).toJSON === "function"
	) {
		// e.g. a Date: what JSON would have sent
		appendRails(entries, key, (value as { toJSON: () => unknown }).toJSON());
	} else {
		entries.push([key, toFormValue(value)]);
	}
};

class RailsApiClient extends JsonApiClient {
	/**
	 * @remarks A body with a file (a Blob, or a data URI) is sent as multipart, with its
	 *          files as file parts, as long as Rails' keys can express it. A Blob that is
	 *          not a File is named `blob`, pass a File to name it.
	 * @see JsonApiClient.convertBody
	 */
	public async convertBody(
		body: unknown | null,
		headers: Record<string, string>,
	): Promise<string | FormData | null> {
		if (isPlainObject(body) && containsFile(body) && isMultipartSafe(body)) {
			const entries: [string, FormValue][] = [];
			Object.entries(body).forEach(([key, value]) =>
				appendRails(entries, key, value),
			);
			const formBody = new FormData();
			entries.forEach(([key, value]) => formBody.append(key, value));
			return formBody;
		}
		// JSON, with its Blobs as data URIs
		return super.convertBody(body, headers);
	}
}

export default RailsApiClient;
