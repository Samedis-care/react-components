import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { Framework } from "../../src/framework";
import FileUpload, {
	FileData,
	FileMeta,
	FileUploadDispatch,
	FileUploadProps,
} from "../../src/standalone/FileUpload/Generic";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(() => {
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
});

afterEach(cleanup);

const STORED: FileData<FileMeta> = {
	file: {
		name: "report.pdf",
		type: "application/pdf",
		downloadLink: "#report",
	},
};

const pick = (name: string, type = "text/plain") =>
	new File(["content"], name, { type });

const renderUpload = (props?: Partial<FileUploadProps>) => {
	const ref = React.createRef<FileUploadDispatch>();
	const onChange = vi.fn<(files: FileData[]) => void>();
	const { container } = render(
		<Framework>
			<FileUpload
				ref={ref}
				previewSize={24}
				handleError={() => {}}
				onChange={onChange}
				{...props}
			/>
		</Framework>,
	);
	return {
		addFile: async (file: File) => {
			await act(async () => {
				await ref.current?.addFile(file);
			});
		},
		/** The value the control last handed out */
		value: () => onChange.mock.lastCall?.[0] ?? [],
		/** What every listed file is shown as, relative to the server, in list order */
		changes: () =>
			Array.from(
				container.querySelectorAll<HTMLElement>('[class*="CcFile-label"]'),
			).map((label) => [
				label.textContent,
				label.getAttribute("data-cc-change"),
			]),
	};
};

describe("FileUpload — picking a file with the name of one already listed", () => {
	it("marks a file from the server for deletion rather than dropping it", async () => {
		const ui = renderUpload({ files: [STORED] });
		const replacement = pick("report.pdf", "application/pdf");

		await ui.addFile(replacement);

		// the submit has to know to delete the old one, as it does for a removed file
		expect(ui.value()).toEqual([
			expect.objectContaining({ file: STORED.file, delete: true }),
			expect.objectContaining({ file: replacement, canBeUploaded: true }),
		]);
		expect(ui.changes()).toEqual([
			["report.pdf", "removed"],
			["report.pdf", "added"],
		]);
	});

	it("drops a picked file, which has nothing on the server", async () => {
		const ui = renderUpload();
		await ui.addFile(pick("notes.txt"));
		const replacement = pick("notes.txt");

		await ui.addFile(replacement);

		expect(ui.value()).toEqual([
			expect.objectContaining({ file: replacement, canBeUploaded: true }),
		]);
	});

	it("leaves a file that cannot be deleted, and lists the new one beside it", async () => {
		const ui = renderUpload({ files: [{ ...STORED, preventDelete: true }] });
		const replacement = pick("report.pdf", "application/pdf");

		await ui.addFile(replacement);

		expect(ui.value()).toEqual([
			expect.objectContaining({ file: STORED.file, delete: false }),
			expect.objectContaining({ file: replacement, canBeUploaded: true }),
		]);
	});

	it("keeps both untouched with allowDuplicates", async () => {
		const ui = renderUpload({ files: [STORED], allowDuplicates: true });
		const duplicate = pick("report.pdf", "application/pdf");

		await ui.addFile(duplicate);

		expect(ui.value()).toEqual([
			expect.objectContaining({ file: STORED.file, delete: false }),
			expect.objectContaining({ file: duplicate, canBeUploaded: true }),
		]);
	});
});
