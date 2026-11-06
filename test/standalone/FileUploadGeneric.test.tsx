import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import userEventLib from "@testing-library/user-event";
import { Framework } from "../../src/framework";
import FileUpload, {
	FileData,
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

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.useRealTimers();
});

const pick = (name: string, type = "text/plain") =>
	new File(["content"], name, { type });

const renderUpload = (props?: Partial<FileUploadProps>) => {
	const ref = React.createRef<FileUploadDispatch>();
	const onChange = vi.fn<(files: FileData[]) => void>();
	const handleError = vi.fn();
	const el = (p?: Partial<FileUploadProps>) => (
		<Framework>
			<FileUpload
				ref={ref}
				previewSize={24}
				handleError={handleError}
				onChange={onChange}
				{...props}
				{...p}
			/>
		</Framework>
	);
	const utils = render(el());
	const c = utils.container;
	return {
		...utils,
		ref,
		onChange,
		handleError,
		rerenderWith: (p: Partial<FileUploadProps>) => utils.rerender(el(p)),
		/** The value the control last handed out */
		value: () => onChange.mock.lastCall?.[0] ?? [],
		/** The names of the files that stay after a save (no delete flag) */
		kept: () =>
			(onChange.mock.lastCall?.[0] ?? [])
				.filter((f) => !f.delete)
				.map((f) => f.file.name),
		input: () => c.querySelector<HTMLInputElement>('input[type="file"]'),
		dropzone: () => c.querySelector<HTMLElement>(".components-care-dropzone")!,
		/** [name, data-cc-change] of every listed file, in list order */
		labels: () =>
			Array.from(
				c.querySelectorAll<HTMLElement>(
					'[class*="CcFile-label"], [class*="CcFile-listLabel"]',
				),
			).map((l) => [l.textContent, l.getAttribute("data-cc-change")]),
		icons: (id: string) => c.querySelectorAll(`[data-testid="${id}"]`),
		addFile: async (f: File) => {
			await act(async () => {
				await ref.current!.addFile(f);
			});
		},
		drop: async (files: File[]) => {
			await act(async () => {
				fireEvent.drop(c.querySelector(".components-care-dropzone")!, {
					dataTransfer: { files },
				});
				await Promise.resolve();
			});
		},
		change: async (files: File[]) => {
			await act(async () => {
				fireEvent.change(c.querySelector('input[type="file"]')!, {
					target: { files },
				});
				await Promise.resolve();
			});
		},
	};
};

describe("FileUpload — picking through the input", () => {
	it("[ISSUE-3489-ITEM-5] clears the input after a pick, so the same file can be picked again", async () => {
		const user = userEventLib.setup({ applyAccept: false });
		const ui = renderUpload();
		await act(async () => {
			await user.upload(ui.input()!, pick("a.txt"));
		});
		expect(ui.value().map((f) => f.file.name)).toEqual(["a.txt"]);
		// browsers fire no change event for a selection equal to the input's current value
		expect(ui.input()!.value).toBe("");
	});
});

describe("FileUpload — picking the same file again", () => {
	it("[ISSUE-3489-ITEM-5] a refused pick is cleared too, so it can be tried again", async () => {
		const user = userEventLib.setup({ applyAccept: false });
		const ui = renderUpload({ accept: ".pdf" });
		await act(async () => {
			await user.upload(ui.input()!, pick("a.txt"));
		});
		expect(ui.handleError).toHaveBeenCalledWith(
			"files.type.invalid",
			expect.any(String),
		);
		expect(ui.input()!.value).toBe("");
	});

	it("[ISSUE-3489-ITEM-5] every file of a pick is listed, although clearing the input empties its file list", async () => {
		const ui = renderUpload();
		const input = ui.input()!;
		// a FileList that clearing the input empties in place, as some browsers do
		const selection = [pick("a.txt"), pick("b.txt")];
		Object.defineProperty(input, "files", {
			configurable: true,
			get: () => selection,
		});
		Object.defineProperty(input, "value", {
			configurable: true,
			get: () => (selection.length ? "C:\\fakepath\\a.txt" : ""),
			set: (v: string) => {
				if (v === "") selection.length = 0;
			},
		});
		await act(async () => {
			fireEvent.change(input);
			await Promise.resolve();
		});
		expect(ui.value().map((f) => f.file.name)).toEqual(["a.txt", "b.txt"]);
		expect(input.value).toBe("");
	});
});
