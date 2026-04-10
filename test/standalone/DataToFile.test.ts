import { describe, it, expect } from "vitest";
import dataToFile from "../../src/utils/dataToFile";

describe("dataToFile", () => {
	it("converts a data URI to a Blob", () => {
		// "hello" in base64
		const result = dataToFile("data:text/plain;base64,aGVsbG8=");
		expect(result).toBeInstanceOf(Blob);
		expect(result.type).toBe("text/plain");
	});

	it("returns a File with the correct name when name param is present", () => {
		const result = dataToFile("data:text/plain;name=test.txt;base64,aGVsbG8=");
		expect(result).toBeInstanceOf(File);
		expect((result as File).name).toBe("test.txt");
		expect(result.type).toBe("text/plain");
	});

	it("decodes URI-encoded file names", () => {
		const result = dataToFile(
			"data:text/plain;name=my%20file%20(1).txt;base64,aGVsbG8=",
		);
		expect(result).toBeInstanceOf(File);
		expect((result as File).name).toBe("my file (1).txt");
	});

	it("returns a Blob (not File) when no name param is present", () => {
		const result = dataToFile("data:text/plain;base64,aGVsbG8=");
		expect(result).toBeInstanceOf(Blob);
		expect(result).not.toBeInstanceOf(File);
	});

	it("handles empty data URI", () => {
		const result = dataToFile("data:");
		expect(result).toBeInstanceOf(Blob);
		expect(result.size).toBe(0);
	});

	it("preserves binary content", async () => {
		// [0, 1, 2, 255] => "AAEC/w=="
		const result = dataToFile("data:application/octet-stream;base64,AAEC/w==");
		const buffer = await result.arrayBuffer();
		expect(new Uint8Array(buffer)).toEqual(new Uint8Array([0, 1, 2, 255]));
	});

	it("round-trips with fileToData including name", async () => {
		const original = new File(["hello world"], "report.pdf", {
			type: "application/pdf",
		});
		// simulate what fileToData produces with includeName=true
		const { default: fileToData } = await import("../../src/utils/fileToData");
		const dataUri = await fileToData(original, true);
		const restored = dataToFile(dataUri);
		expect(restored).toBeInstanceOf(File);
		expect((restored as File).name).toBe("report.pdf");
		expect(restored.type).toBe("application/pdf");
		const text = await restored.text();
		expect(text).toBe("hello world");
	});
});
