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
const convertDataToFormData = (data: unknown): string | Blob => {
	if (typeof data === "number") return data.toString();
	if (typeof data === "boolean") return data ? "true" : "false";
	if (data === null) return "null";
	if (typeof data !== "string") {
		// eslint-disable-next-line no-console
		console.log(
			"[Components-Care] [RailsApiClient] [convertDataToFormData] unsupported data",
			data
		);
		throw new Error("unsupported data " + JSON.stringify(data));
	}
	if (data.startsWith("data:")) {
		return dataToFile(data);
	}
	return data;
};
const objectToRails = (
	obj: Record<string, unknown>
): [string, string | Blob][] => {
	const ret: [string, string | Blob][] = [];
	for (const key in obj) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

		const value = obj[key];
		if (Array.isArray(value)) {
			ret.push(
				...value.map(
					(val) =>
						[key + "[]", convertDataToFormData(val)] as [string, string | Blob]
				)
			);
		} else if (typeof value === "object") {
			const dots = objectToRails(value as Record<string, unknown>);
			dots.forEach(([dot, nestedValue]) => {
				ret.push([key + "[" + dot + "]", nestedValue]);
			});
		} else if (value !== undefined) {
			ret.push([key, convertDataToFormData(value)]);
		}
	}
	return ret;
};

class RailsApiClient extends JsonApiClient {
	protected convertBody(
		body: unknown | null,
		headers: Record<string, string>
	): string | FormData | null {
		if (objectContainsBlob(body as Record<string, unknown>)) {
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
