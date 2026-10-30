import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Framework } from "../../src/framework";
import {
	configureErrorReporting,
	getErrorReportingConfig,
} from "../../src/framework/ErrorReporting";
import FileUpload, {
	FileData,
	FileMeta,
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

const STORED: FileData<FileMeta>[] = [
	{
		file: {
			name: "report.pdf",
			type: "application/pdf",
			downloadLink: "#report",
		},
	},
];

/** An onDelete that waits for the test's answer */
const askUser = () => {
	const answers: ((confirmed: boolean) => void)[] = [];
	return {
		onDelete: vi.fn<(file: FileData) => Promise<boolean>>(
			() => new Promise((resolve) => answers.push(resolve)),
		),
		/** Answers the first question asked */
		answer: (confirmed: boolean) =>
			act(async () => {
				answers[0](confirmed);
				await new Promise((resolve) => setTimeout(resolve, 0));
			}),
	};
};

const renderUpload = (props: Partial<FileUploadProps>) => {
	const element = (extra?: Partial<FileUploadProps>) => (
		<Framework>
			<FileUpload
				previewSize={24}
				handleError={() => {}}
				files={STORED}
				{...props}
				{...extra}
			/>
		</Framework>
	);
	const { container, rerender, unmount } = render(element());
	return {
		unmount,
		/** Renders the same control again with these props changed */
		update: (extra: Partial<FileUploadProps>) => rerender(element(extra)),
		remove: () =>
			act(async () => {
				fireEvent.click(
					container.querySelector('[data-testid="CancelOutlinedIcon"]')!,
				);
				await new Promise((resolve) => setTimeout(resolve, 0));
			}),
	};
};

describe("FileUpload: onDelete", () => {
	it("[ISSUE-3511-ITEM-22] an onDelete that rejects keeps the file, and is reported", async () => {
		const before = { ...getErrorReportingConfig() };
		const report = vi.fn();
		configureErrorReporting({ report, shouldReport: () => true });
		try {
			const failure = new Error("confirmation failed");
			const onChange = vi.fn();
			const ui = renderUpload({
				onChange,
				onDelete: () => Promise.reject(failure),
			});

			await ui.remove();

			expect(onChange).not.toHaveBeenCalled();
			expect(report).toHaveBeenCalledWith(
				failure,
				expect.objectContaining({ source: "FileUpload.onDelete" }),
			);
		} finally {
			configureErrorReporting(before);
		}
	});

	it("[ISSUE-3511-ITEM-22] a removal confirmed after the files were passed in again still removes the file", async () => {
		const ask = askUser();
		const onChange = vi.fn();
		const ui = renderUpload({ onChange, onDelete: ask.onDelete });

		await ui.remove();
		// the same file, in a new list of new entries, as an owner re-rendering passes it
		ui.update({ files: STORED.map((file) => ({ ...file })) });
		await ask.answer(true);

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.lastCall?.[0]).toEqual([
			expect.objectContaining({ file: STORED[0].file, delete: true }),
		]);
	});

	it("[ISSUE-3511-ITEM-22] a removal confirmed after the file left the list reports nothing", async () => {
		const ask = askUser();
		const onChange = vi.fn();
		const ui = renderUpload({ onChange, onDelete: ask.onDelete });

		await ui.remove();
		ui.update({ files: [] });
		await ask.answer(true);

		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3511-ITEM-22] a removal confirmed after the field turned read-only removes nothing", async () => {
		const ask = askUser();
		const onChange = vi.fn();
		const ui = renderUpload({ onChange, onDelete: ask.onDelete });

		await ui.remove();
		ui.update({ readOnly: true });
		await ask.answer(true);

		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3511-ITEM-22] a removal confirmed after the field was unmounted reports nothing", async () => {
		const ask = askUser();
		const onChange = vi.fn();
		const ui = renderUpload({ onChange, onDelete: ask.onDelete });

		await ui.remove();
		ui.unmount();
		await ask.answer(true);

		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3511-ITEM-22] a removal confirmed after onChange was replaced reports to the new handler", async () => {
		const ask = askUser();
		const first = vi.fn();
		const second = vi.fn();
		const ui = renderUpload({ onChange: first, onDelete: ask.onDelete });

		await ui.remove();
		ui.update({ onChange: second });
		await ask.answer(true);

		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(1);
	});
});
