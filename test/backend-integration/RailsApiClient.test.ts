import { describe, expect, it } from "vitest";
import RailsApiClient from "../../src/backend-integration/Connector/RailsApiClient";

const client = new RailsApiClient(
	() => "",
	(_response, data) => data,
);

const convert = async (body: Record<string, unknown>) => {
	const headers: Record<string, string> = {};
	const converted = await client.convertBody(body, headers);
	return { converted, headers };
};

const entriesOf = (form: FormData) =>
	Array.from(form.entries()).map(([key, value]) => [
		key,
		value instanceof Blob ? `<${value.name}:${value.type}>` : value,
	]);

describe("RailsApiClient.convertBody", () => {
	it("sends a body without files as JSON", async () => {
		const body = { data: { name: "a", count: 1, tags: [{ id: 1 }] } };
		const { converted, headers } = await convert(body);
		expect(converted).toBe(JSON.stringify(body));
		expect(headers["Content-Type"]).toBe("application/json");
	});

	it("sends a body with a Blob as multipart, with the Blob as file part", async () => {
		const image = new File(["png"], "photo.png", { type: "image/png" });
		const { converted, headers } = await convert({
			data: {
				image,
				role: "type_plate",
				quality: { blur: 212.4, glare: 0.01 },
				primary: true,
				notes: null,
				skipped: undefined,
			},
		});
		expect(converted).toBeInstanceOf(FormData);
		// the browser sets the multipart boundary itself
		expect(headers["Content-Type"]).toBeUndefined();
		expect(entriesOf(converted as FormData)).toEqual([
			["data[image]", "<photo.png:image/png>"],
			["data[role]", "type_plate"],
			["data[quality][blur]", "212.4"],
			["data[quality][glare]", "0.01"],
			["data[primary]", "true"],
		]);
		expect((converted as FormData).get("data[image]")).toBe(image);
	});

	it("sends an array of Blobs as repeated file parts", async () => {
		const { converted } = await convert({
			data: {
				files: [
					new File(["a"], "a.txt", { type: "text/plain" }),
					new File(["b"], "b.txt", { type: "text/plain" }),
				],
			},
		});
		expect(entriesOf(converted as FormData)).toEqual([
			["data[files][]", "<a.txt:text/plain>"],
			["data[files][]", "<b.txt:text/plain>"],
		]);
	});

	it("still uploads a data URI as a file, named by its name parameter", async () => {
		const { converted } = await convert({
			data: { document: "data:text/plain;name=notes.txt;base64,aGVsbG8=" },
		});
		expect(entriesOf(converted as FormData)).toEqual([
			["data[document]", "<notes.txt:text/plain>"],
		]);
	});

	it("sends a Date in a multipart body as JSON would", async () => {
		const { converted } = await convert({
			data: {
				image: new Blob(["png"], { type: "image/png" }),
				taken_at: new Date("2026-09-28T10:00:00.000Z"),
			},
		});
		expect(entriesOf(converted as FormData)).toEqual([
			["data[image]", "<blob:image/png>"],
			["data[taken_at]", "2026-09-28T10:00:00.000Z"],
		]);
	});

	it("sends a body with an array of objects as JSON, with its Blobs as data URIs", async () => {
		const { converted, headers } = await convert({
			data: {
				type_plate: new File(["hello"], "plate.jpg", { type: "image/jpeg" }),
				nics: [{ mac: "00:11" }, { ip: "10.0.0.1" }],
			},
		});
		expect(headers["Content-Type"]).toBe("application/json");
		expect(JSON.parse(converted as string)).toEqual({
			data: {
				type_plate: "data:image/jpeg;name=plate.jpg;base64,aGVsbG8=",
				nics: [{ mac: "00:11" }, { ip: "10.0.0.1" }],
			},
		});
	});
});
