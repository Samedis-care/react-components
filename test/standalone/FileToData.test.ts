import { describe, it, expect } from "vitest";
import fileToData from "../../src/utils/fileToData";

/**
 * Helper to create a File with the given content and name.
 */
const makeFile = (content: string, name: string, type = "text/plain"): File => {
	return new File([content], name, { type });
};

describe("fileToData", () => {
	it("converts a file to a base64 data URI", async () => {
		const file = makeFile("hello", "test.txt");
		const result = await fileToData(file);
		expect(result).toMatch(/^data:text\/plain;base64,/);
		// "hello" in base64 is "aGVsbG8="
		expect(result).toBe("data:text/plain;base64,aGVsbG8=");
	});

	it("handles an empty file", async () => {
		const file = makeFile("", "empty.txt", "application/octet-stream");
		const result = await fileToData(file);
		expect(result).toBe("data:application/octet-stream;base64,");
	});

	it("includes the file name when includeName is true", async () => {
		const file = makeFile("hello", "test.txt");
		const result = await fileToData(file, true);
		expect(result).toBe("data:text/plain;name=test.txt;base64,aGVsbG8=");
	});

	it("URI-encodes special characters in the file name", async () => {
		const file = makeFile("hello", "my file (1).txt");
		const result = await fileToData(file, true);
		expect(result).toContain(";name=my%20file%20(1).txt;base64,");
	});

	it("does not include the file name when includeName is false", async () => {
		const file = makeFile("hello", "test.txt");
		const result = await fileToData(file, false);
		expect(result).not.toContain(";name=");
	});

	it("preserves binary content correctly", async () => {
		const bytes = new Uint8Array([0, 1, 2, 255]);
		const file = new File([bytes], "binary.bin", {
			type: "application/octet-stream",
		});
		const result = await fileToData(file);
		// [0, 1, 2, 255] in base64 is "AAEC/w=="
		expect(result).toBe("data:application/octet-stream;base64,AAEC/w==");
	});

	it("URI-encodes unicode file names", async () => {
		const file = makeFile("data", "日本語.txt");
		const result = await fileToData(file, true);
		expect(result).toContain(
			`;name=${encodeURIComponent("日本語.txt")};base64,`,
		);
	});
});
