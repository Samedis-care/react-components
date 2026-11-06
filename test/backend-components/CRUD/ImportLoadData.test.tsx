/**
 * Step 1 of the import wizard ("Upload data", useImportStep1FileUploadProps and
 * Step1LoadData): what the upload accepts, how a picked .xlsx becomes `state.data` (the rows
 * every conversion script reads), and the feedback on refused or unreadable files.
 */
import { describe, expect, it, vi } from "vitest";
import {
	act,
	fireEvent,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import XLSX from "xlsx";
import { useImportStep1FileUploadProps } from "../../../src/backend-components/CRUD/Import/Step1LoadData";
import type { FileData } from "../../../src/standalone/FileUpload/Generic";
import { LOAD, setupCrudTests } from "./crudFixture";
import {
	importModel,
	initState,
	PEOPLE,
	renderStep,
	xlsxFile,
} from "./importFixture";

setupCrudTests();

type RejectionListener = (reason: unknown) => void;

/**
 * Node's process, as far as these tests use it (the unit project has no Node types)
 */
const nodeProcess = (
	globalThis as unknown as {
		process: {
			listeners(event: "unhandledRejection"): RejectionListener[];
			removeAllListeners(event: "unhandledRejection"): void;
			on(event: "unhandledRejection", listener: RejectionListener): void;
			removeListener(
				event: "unhandledRejection",
				listener: RejectionListener,
			): void;
		};
	}
).process;

const mountStep1 = () =>
	renderStep(useImportStep1FileUploadProps, importModel(), initState([]));

const picked = (file: File): FileData[] => [{ file, canBeUploaded: true }];

describe("Step 1: unreadable files", () => {
	it("[ISSUE-3508-ITEM-9] tells the user when the picked file cannot be read", async () => {
		// the failed read is an unhandled rejection today: collect it here instead of
		// letting it fail the whole run, and assert that there is none
		const saved = nodeProcess.listeners("unhandledRejection");
		nodeProcess.removeAllListeners("unhandledRejection");
		const rejections: unknown[] = [];
		const collect = (reason: unknown) => rejections.push(reason);
		nodeProcess.on("unhandledRejection", collect);
		try {
			const { result } = mountStep1();
			// a zip header followed by garbage: SheetJS cannot open it
			const broken = new File(
				[
					new Uint8Array([
						0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
					]),
				],
				"broken.xlsx",
			);
			act(() => result.current.result.onChange!(picked(broken)));
			// a dialog like the refused-file one, or an inline alert
			await waitFor(
				() =>
					expect(
						document.querySelector("[role=dialog], [role=alert]"),
					).not.toBeNull(),
				{ timeout: 3000 },
			);
			expect(rejections).toEqual([]);
			expect(result.current.state.files).toEqual([]);
		} finally {
			nodeProcess.removeListener("unhandledRejection", collect);
			saved.forEach((listener) =>
				nodeProcess.on("unhandledRejection", listener),
			);
		}
	});

	it("[ISSUE-3508-ITEM-9] names the file it cannot read in a dialog like the refused-file one, and drops the rows of the file before", async () => {
		const { result } = mountStep1();
		act(() =>
			result.current.result.onChange!(picked(xlsxFile([["Data", PEOPLE]]))),
		);
		await waitFor(
			() => expect(result.current.state.data).toHaveLength(2),
			LOAD,
		);

		// SheetJS refuses an encrypted workbook with this error
		vi.spyOn(XLSX, "read").mockImplementation(() => {
			throw new Error("File is password-protected");
		});
		act(() =>
			result.current.result.onChange!(
				picked(xlsxFile([["Data", PEOPLE]], "locked.xlsx")),
			),
		);
		const dialog = await screen.findByRole("dialog", undefined, LOAD);
		expect(dialog).toHaveAccessibleName("Invalid file selected");
		expect(dialog).toHaveTextContent(
			"locked.xlsx cannot be read. Save it as an Excel workbook (.xlsx) without a password and pick it again.",
		);
		expect(result.current.state.files).toEqual([]);
		expect(result.current.state.data).toEqual([]);

		fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});
});
