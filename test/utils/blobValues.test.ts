import { describe, expect, it } from "vitest";
import deepClone from "../../src/utils/deepClone";
import deepEqual from "../../src/utils/deepEqual";
import toComparisonJson from "../../src/utils/toComparisonJson";
import replaceFileExt from "../../src/utils/replaceFileExt";

const png = () => new File(["png"], "photo.png", { type: "image/png" });

describe("Blob values in form values", () => {
	it("deepClone keeps a Blob, a File included, as it is", () => {
		const file = png();
		const blob = new Blob(["x"], { type: "image/jpeg" });
		const clone = deepClone({ image: file, preview: blob, files: [file] });
		expect(clone.image).toBe(file);
		expect(clone.preview).toBe(blob);
		expect(clone.files[0]).toBe(file);
	});

	it("deepEqual compares Blobs by identity", () => {
		const file = png();
		expect(deepEqual({ image: file }, { image: file })).toBe(true);
		expect(deepEqual({ image: file }, { image: png() })).toBe(false);
		expect(deepEqual({ image: file }, { image: "https://x/y.png" })).toBe(
			false,
		);
	});

	it("toComparisonJson tells one picked file from another", () => {
		const first = png();
		const second = png();
		expect(JSON.stringify({ image: first })).toBe(
			JSON.stringify({ image: second }),
		);
		expect(toComparisonJson({ image: first })).not.toBe(
			toComparisonJson({ image: second }),
		);
		expect(toComparisonJson({ image: first })).toBe(
			toComparisonJson({ image: first }),
		);
		expect(toComparisonJson({ a: 1, b: ["x"] })).toBe(
			JSON.stringify({ a: 1, b: ["x"] }),
		);
	});
});

describe("replaceFileExt", () => {
	it("gives the name the extension of the new type", () => {
		expect(replaceFileExt("photo.heic", "image/jpeg")).toBe("photo.jpg");
		expect(replaceFileExt("scan.final.png", "image/webp")).toBe(
			"scan.final.webp",
		);
		expect(replaceFileExt("image", "image/png")).toBe("image.png");
		expect(replaceFileExt(".hidden", "image/svg+xml")).toBe(".hidden.svg");
	});
});
