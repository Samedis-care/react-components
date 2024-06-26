import JsonApiClient from "./JsonApiClient";
import dataToFile from "../../utils/dataToFile";

const objectContainsBlob = (obj: Record<string, unknown>) => {
	for (const key in obj) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
		const value = obj[key];
		if (typeof value === "object") {
			if (objectContainsBlob(value as Record<string, unknown>)) return true;
		} else if (typeof value === "string") {
			if (value.startsWith("data:")) return true;
		}
	}
	return false;
};
const objectContainsArrayOfObjects = (obj: Record<string, unknown>) => {
	if (Array.isArray(obj)) {
		if (obj.find((entry) => typeof entry === "object") !== undefined)
			return true;
	}
	for (const key in obj) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
		const value = obj[key];
		if (typeof value === "object") {
			if (objectContainsArrayOfObjects(value as Record<string, unknown>))
				return true;
		}
	}
	return false;
};
const convertDataToFormData = (data: unknown): string | Blob => {
	if (typeof data === "number") return data.toString();
	if (typeof data === "boolean") return data ? "true" : "false";
	if (data === null) return "null";
	if (typeof data !== "string") {
		// eslint-disable-next-line no-console
		console.log(
			"[Components-Care] [RailsApiClient] [convertDataToFormData] unsupported data",
			data,
		);
		throw new Error("unsupported data " + JSON.stringify(data));
	}
	if (data.startsWith("data:")) {
		return dataToFile(data);
	}
	return data;
};
const objectToRails = (
	obj: Record<string, unknown>,
): [string, string | Blob][] => {
	const ret: [string, string | Blob][] = [];
	for (const key in obj) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

		const value = obj[key];
		if (Array.isArray(value)) {
			ret.push(
				...value.map(
					(val) =>
						[key + "[]", convertDataToFormData(val)] as [string, string | Blob],
				),
			);
		} else if (typeof value === "object") {
			const dots = objectToRails(value as Record<string, unknown>);
			dots.forEach(([dot, nestedValue]) => {
				const [dotKey, ...suffix] = dot.split("[");
				ret.push([
					key +
						"[" +
						dotKey +
						"]" +
						(suffix.length > 0 ? "[" + suffix.join("[") : ""),
					nestedValue,
				]);
			});
		} else if (value !== undefined) {
			ret.push([key, convertDataToFormData(value)]);
		}
	}
	return ret;
};

class RailsApiClient extends JsonApiClient {
	public convertBody(
		body: unknown | null,
		headers: Record<string, string>,
	): string | FormData | null {
		if (
			objectContainsBlob(body as Record<string, unknown>) &&
			!objectContainsArrayOfObjects(body as Record<string, unknown>) // too sketchy, does not work with omitted/optional keys
		) {
			const formBody = new FormData();
			objectToRails(body as Record<string, unknown>).forEach(([key, value]) => {
				formBody.append(key, value);
			});
			return formBody;
		} else {
			// Use JSON
			return super.convertBody(body, headers);
		}
	}
}

export default RailsApiClient;
