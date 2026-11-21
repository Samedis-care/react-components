import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Framework } from "../../src/framework";
import FileUpload, {
	FileData,
	FileUploadDispatch,
	FileUploadProps,
} from "../../src/standalone/FileUpload/Generic";

// jsdom has no canvas, so the image pipeline itself is replaced; what is tested here is
// when the control processes, what it does with the result and how it reports failures
const processImageMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/utils/processImage", () => ({ default: processImageMock }));
const captureErrorMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/framework/ErrorReporting", async (importOriginal) => ({
	...(await importOriginal<object>()),
	captureError: captureErrorMock,
}));

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

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	processImageMock.mockReset();
	captureErrorMock.mockReset();
});

const jpg = (name = "a.jpg") => new File(["x"], name, { type: "image/jpeg" });

const renderUpload = (props?: Partial<FileUploadProps>) => {
	const ref = React.createRef<FileUploadDispatch>();
	const onChange = vi.fn<(files: FileData[]) => void>();
	const handleError = vi.fn();
	const utils = render(
		<Framework>
			<FileUpload
				ref={ref}
				previewSize={24}
				handleError={handleError}
				onChange={onChange}
				{...props}
			/>
		</Framework>,
	);
	return {
		...utils,
		onChange,
		handleError,
		value: () => onChange.mock.lastCall?.[0] ?? [],
		addFile: async (f: File) => {
			await act(async () => {
				await ref.current!.addFile(f);
			});
		},
		drop: async (files: File[]) => {
			await act(async () => {
				fireEvent.drop(
					utils.container.querySelector(".components-care-dropzone")!,
					{ dataTransfer: { files } },
				);
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
		},
	};
};

describe("FileUpload — image processing", () => {
	it("[ISSUE-3489-ITEM-6] a drop made while the image of another is converted cannot take the same last slot", async () => {
		// each conversion waits until the test finishes it
		const converting: (() => void)[] = [];
		processImageMock.mockImplementation(
			(file: File) =>
				new Promise<File>((resolve) => converting.push(() => resolve(file))),
		);
		const ui = renderUpload({ maxFiles: 1, convertImagesTo: "image/png" });
		await ui.drop([jpg("a.jpg")]);
		await ui.drop([jpg("b.jpg")]);
		// both passed the check made before the conversion: the list was still empty
		expect(converting).toHaveLength(2);
		await act(async () => {
			converting.forEach((finish) => finish());
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(ui.value().map((f) => f.file.name)).toEqual(["a.jpg"]);
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.selector.too-many",
			"Too many files selected",
		);
	});

	it("[ISSUE-3489-ITEM-6] a selection with no free slot is refused before its images are processed", async () => {
		const ui = renderUpload({
			maxFiles: 1,
			convertImagesTo: "image/png",
			files: [
				{
					file: {
						name: "report.pdf",
						type: "application/pdf",
						downloadLink: "/report.pdf",
					},
				},
			],
		});
		await ui.drop([jpg()]);
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.selector.too-many",
			"Too many files selected",
		);
		expect(processImageMock).not.toHaveBeenCalled();
		expect(ui.onChange).not.toHaveBeenCalled();
	});
});
