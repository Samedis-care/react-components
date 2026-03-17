import { describe, it, expect } from "vitest";
import {
	getFileType,
	getFileIcon,
	getFileIconOrDefault,
	ExcelFileExtensions,
	ExcelMimeType,
	WordFileExtensions,
	WordMimeType,
	PowerPointFileExtensions,
	PowerPointMimeType,
	ArchiveFileExtensions,
	ArchiveMimeType,
	AudioFileExtensions,
	ImageFileExtensions,
	CodeFileExtensions,
	CsvFileExtensions,
	TextFileExtensions,
	VideoFileExtensions,
	PdfFileExtensions,
	CsvMimeType,
	TextFileMimeType,
} from "../../src/standalone/FileUpload/Generic/File";

// ---------------------------------------------------------------------------
// getFileType — MIME type detection
// ---------------------------------------------------------------------------

describe("getFileType — MIME detection", () => {
	it("identifies PDF via MIME", () => {
		expect(getFileType(null, "application/pdf")).toBe("pdf");
	});

	it("identifies image via MIME prefix", () => {
		expect(getFileType(null, "image/jpeg")).toBe("image");
		expect(getFileType(null, "image/png")).toBe("image");
		expect(getFileType(null, "image/gif")).toBe("image");
	});

	it("identifies audio via MIME prefix", () => {
		expect(getFileType(null, "audio/mp3")).toBe("audio");
		expect(getFileType(null, "audio/wav")).toBe("audio");
	});

	it("identifies video via MIME prefix", () => {
		expect(getFileType(null, "video/mp4")).toBe("video");
		expect(getFileType(null, "video/webm")).toBe("video");
	});

	it("identifies text/plain as text", () => {
		for (const mime of TextFileMimeType) {
			expect(getFileType(null, mime)).toBe("text");
		}
	});

	it("identifies text/csv as csv", () => {
		for (const mime of CsvMimeType) {
			expect(getFileType(null, mime)).toBe("csv");
		}
	});

	it("identifies all Excel MIME types", () => {
		for (const mime of ExcelMimeType) {
			expect(getFileType(null, mime)).toBe("excel");
		}
	});

	it("identifies all Word MIME types", () => {
		for (const mime of WordMimeType) {
			expect(getFileType(null, mime)).toBe("word");
		}
	});

	it("identifies all PowerPoint MIME types", () => {
		for (const mime of PowerPointMimeType) {
			expect(getFileType(null, mime)).toBe("power-point");
		}
	});

	it("identifies all Archive MIME types", () => {
		for (const mime of ArchiveMimeType) {
			expect(getFileType(null, mime)).toBe("archive");
		}
	});

	it("returns null for an unknown MIME type with no file name", () => {
		expect(getFileType(null, "application/octet-stream")).toBeNull();
	});

	it("returns null when both arguments are null", () => {
		expect(getFileType(null, null)).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// getFileType — extension detection (fallback when MIME not recognised)
// ---------------------------------------------------------------------------

describe("getFileType — extension fallback", () => {
	it("identifies PDF by extension", () => {
		for (const ext of PdfFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("pdf");
		}
	});

	it("identifies image by extension", () => {
		for (const ext of ImageFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("image");
		}
	});

	it("identifies audio by extension", () => {
		for (const ext of AudioFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("audio");
		}
	});

	it("identifies video by extension", () => {
		for (const ext of VideoFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("video");
		}
	});

	it("identifies Excel by extension", () => {
		for (const ext of ExcelFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("excel");
		}
	});

	it("identifies Word by extension", () => {
		for (const ext of WordFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("word");
		}
	});

	it("identifies PowerPoint by extension", () => {
		for (const ext of PowerPointFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("power-point");
		}
	});

	it("identifies Archive by extension", () => {
		for (const ext of ArchiveFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("archive");
		}
	});

	it("identifies code files by extension", () => {
		for (const ext of CodeFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("code");
		}
	});

	it("identifies CSV by extension", () => {
		for (const ext of CsvFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("csv");
		}
	});

	it("identifies plain text by extension", () => {
		for (const ext of TextFileExtensions) {
			expect(getFileType(`file.${ext}`, "")).toBe("text");
		}
	});

	it("returns null for an unknown extension", () => {
		expect(getFileType("file.unknownext", "")).toBeNull();
	});

	it("is case-insensitive for extensions", () => {
		expect(getFileType("file.PDF", "")).toBe("pdf");
		expect(getFileType("file.XLSX", "")).toBe("excel");
		expect(getFileType("file.MP3", "")).toBe("audio");
	});

	it("MIME type takes priority over extension", () => {
		// MIME says image, extension says pdf — MIME wins
		expect(getFileType("file.pdf", "image/png")).toBe("image");
	});
});

// ---------------------------------------------------------------------------
// getFileIcon
// ---------------------------------------------------------------------------

describe("getFileIcon", () => {
	it("returns a component for a known MIME type", () => {
		const icon = getFileIcon(null, "application/pdf");
		expect(icon).not.toBeNull();
	});

	it("returns null for an unknown MIME type with no file name", () => {
		const icon = getFileIcon(null, "application/octet-stream");
		expect(icon).toBeNull();
	});

	it("returns a component for a known extension", () => {
		const icon = getFileIcon("document.docx", "");
		expect(icon).not.toBeNull();
	});
});

// ---------------------------------------------------------------------------
// getFileIconOrDefault
// ---------------------------------------------------------------------------

describe("getFileIconOrDefault", () => {
	it("always returns a component — never null", () => {
		const icon = getFileIconOrDefault(null, "application/octet-stream");
		expect(icon).toBeDefined();
		expect(icon).not.toBeNull();
	});

	it("returns the specific icon when MIME is recognised", () => {
		const iconPdf = getFileIconOrDefault(null, "application/pdf");
		const iconDefault = getFileIconOrDefault(null, "application/octet-stream");
		// They should be different components
		expect(iconPdf).not.toBe(iconDefault);
	});

	it("returns the same default icon for two unknown types", () => {
		const icon1 = getFileIconOrDefault(null, "application/octet-stream");
		const icon2 = getFileIconOrDefault(
			"binary.bin",
			"application/octet-stream",
		);
		expect(icon1).toBe(icon2);
	});
});
