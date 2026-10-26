import {
	describe,
	it,
	expect,
	afterAll,
	afterEach,
	beforeAll,
	vi,
} from "vitest";
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { Framework } from "../../src/framework";
import ccI18n from "../../src/i18n";
import FileUpload, {
	FileData,
	FileMeta,
	FileUploadDispatch,
	FileUploadProps,
} from "../../src/standalone/FileUpload/Generic";
import { FileSelectorError } from "../../src/standalone/FileUpload/Generic/Errors";

const initialLanguage = ccI18n.language;

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(async () => {
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
	await ccI18n.init();
	await ccI18n.changeLanguage("en-US");
});

afterAll(async () => {
	await ccI18n.changeLanguage(initialLanguage);
});

afterEach(cleanup);

/** A picked file of the given size in bytes */
const pick = (name: string, size: number) =>
	new File(["x".repeat(size)], name, { type: "text/plain" });

/** A file from the server */
const stored = (name: string, size?: number): FileData<FileMeta> => ({
	file: { name, type: "text/plain", downloadLink: `#${name}`, size },
});

const renderUpload = (props?: Partial<FileUploadProps>) => {
	const ref = React.createRef<FileUploadDispatch>();
	const onChange = vi.fn<(files: FileData[]) => void>();
	const handleError =
		vi.fn<(err: FileSelectorError, message: string) => void>();
	const element = (props?: Partial<FileUploadProps>) => (
		<Framework>
			<FileUpload
				ref={ref}
				previewSize={24}
				handleError={handleError}
				onChange={onChange}
				{...props}
			/>
		</Framework>
	);
	const { container, rerender } = render(element(props));
	return {
		/** Picks the files in one selection, as the file dialog hands them over */
		select: async (...files: File[]) => {
			const input =
				container.querySelector<HTMLInputElement>('input[type="file"]')!;
			Object.defineProperty(input, "files", {
				configurable: true,
				value: files,
			});
			await act(async () => {
				input.dispatchEvent(new Event("change", { bubbles: true }));
				// the control processes a selection asynchronously, as it may have to
				// process images first
				await Promise.resolve();
			});
		},
		/** Adds a file through the imperative handle */
		addFile: async (file: File) => {
			await act(async () => {
				await ref.current?.addFile(file);
			});
		},
		rerender: (props?: Partial<FileUploadProps>) => rerender(element(props)),
		/** The names of the listed files that are not removed */
		listed: () =>
			(onChange.mock.lastCall?.[0] ?? [])
				.filter((file) => !file.delete)
				.map((file) => file.file.name),
		onChange,
		handleError,
	};
};

describe("FileUpload — minFileSize and maxFileSize", () => {
	it("refuses a file below the minimum, naming the file and the limit", async () => {
		const ui = renderUpload({ minFileSize: 1024 });

		await ui.select(pick("tiny.txt", 1023));

		expect(ui.onChange).not.toHaveBeenCalled();
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.size.too-small",
			'"tiny.txt" is too small. Each file must be at least 1\u00a0kB',
		);
	});

	it("refuses a file above the maximum, naming the file and the limit", async () => {
		const ui = renderUpload({ maxFileSize: 15 * 1024 * 1024 });

		await ui.select(pick("huge.txt", 15 * 1024 * 1024 + 1));

		expect(ui.onChange).not.toHaveBeenCalled();
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.size.too-large",
			'"huge.txt" is too large. Each file may be at most 15\u00a0MB',
		);
	});

	it("accepts files exactly at either limit", async () => {
		const ui = renderUpload({ minFileSize: 10, maxFileSize: 20 });

		await ui.select(pick("min.txt", 10));
		await ui.select(pick("max.txt", 20));

		expect(ui.handleError).not.toHaveBeenCalled();
		expect(ui.listed()).toEqual(["min.txt", "max.txt"]);
	});

	it("refuses the whole selection when one file is outside the limits", async () => {
		const ui = renderUpload({ maxFileSize: 20 });

		await ui.select(pick("fine.txt", 5), pick("too-big.txt", 21));

		expect(ui.onChange).not.toHaveBeenCalled();
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.size.too-large",
			expect.stringContaining('"too-big.txt"'),
		);
	});

	it("checks a file added through the imperative handle", async () => {
		const ui = renderUpload({ maxFileSize: 10 });

		await ui.addFile(pick("notes.txt", 11));

		expect(ui.onChange).not.toHaveBeenCalled();
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.size.too-large",
			expect.any(String),
		);
	});

	it("states the limit in the format of the current locale", async () => {
		await act(async () => {
			await ccI18n.changeLanguage("de-DE");
		});
		try {
			const ui = renderUpload({ maxFileSize: 1536 });

			await ui.select(pick("notes.txt", 1537));

			expect(ui.handleError).toHaveBeenCalledWith(
				"files.size.too-large",
				"„notes.txt“ ist zu groß. Jede Datei darf höchstens 1,5\u00a0kB groß sein",
			);
		} finally {
			await act(async () => {
				await ccI18n.changeLanguage("en-US");
			});
		}
	});

	it("applies a limit that changes after mount", async () => {
		const ui = renderUpload({ maxFileSize: 100 });
		ui.rerender({ maxFileSize: 10 });

		await ui.select(pick("notes.txt", 50));

		expect(ui.handleError).toHaveBeenCalledWith(
			"files.size.too-large",
			expect.any(String),
		);
	});

	it("takes 0 as a limit rather than as no limit", async () => {
		const ui = renderUpload({ maxFileSize: 0 });

		await ui.select(pick("notes.txt", 1));

		expect(ui.handleError).toHaveBeenCalledWith(
			"files.size.too-large",
			expect.any(String),
		);
	});
});

describe("FileUpload — maxTotalFileSize", () => {
	it("refuses a pick that would take the listed files over the limit", async () => {
		const ui = renderUpload({ maxTotalFileSize: 10 });
		await ui.select(pick("one.txt", 6));

		await ui.select(pick("two.txt", 5));

		expect(ui.listed()).toEqual(["one.txt"]);
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.selector.too-large",
			"The selected files would exceed the size limit. All files together may be at most 10\u00a0byte",
		);
	});

	it("accepts files that reach the limit exactly", async () => {
		const ui = renderUpload({ maxTotalFileSize: 10 });

		await ui.select(pick("one.txt", 6));
		await ui.select(pick("two.txt", 4));

		expect(ui.handleError).not.toHaveBeenCalled();
		expect(ui.listed()).toEqual(["one.txt", "two.txt"]);
	});

	it("counts files from the server at their size", async () => {
		const ui = renderUpload({
			maxTotalFileSize: 10,
			files: [stored("report.pdf", 8)],
		});

		await ui.select(pick("notes.txt", 3));

		expect(ui.onChange).not.toHaveBeenCalled();
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.selector.too-large",
			expect.any(String),
		);
	});

	it("counts a file from the server without a size as 0 bytes", async () => {
		const ui = renderUpload({
			maxTotalFileSize: 10,
			files: [stored("report.pdf")],
		});

		await ui.select(pick("notes.txt", 10));

		expect(ui.handleError).not.toHaveBeenCalled();
		expect(ui.listed()).toEqual(["report.pdf", "notes.txt"]);
	});

	it("does not count removed files", async () => {
		const ui = renderUpload({
			maxTotalFileSize: 10,
			files: [{ ...stored("report.pdf", 8), delete: true }],
		});

		await ui.select(pick("notes.txt", 10));

		expect(ui.handleError).not.toHaveBeenCalled();
		expect(ui.listed()).toEqual(["notes.txt"]);
	});

	it("counts a file that replaces another of the same name once", async () => {
		const ui = renderUpload({
			maxTotalFileSize: 10,
			files: [stored("report.pdf", 8)],
		});

		await ui.select(pick("report.pdf", 9));

		expect(ui.handleError).not.toHaveBeenCalled();
		expect(ui.listed()).toEqual(["report.pdf"]);
	});

	it("counts both with allowDuplicates, where nothing is replaced", async () => {
		const ui = renderUpload({
			maxTotalFileSize: 10,
			files: [stored("report.pdf", 8)],
			allowDuplicates: true,
		});

		await ui.select(pick("report.pdf", 9));

		expect(ui.handleError).toHaveBeenCalledWith(
			"files.selector.too-large",
			expect.any(String),
		);
	});
});
