/**
 * The import wizard (CrudImport, samedis-care-issues#3508) inside a CRUD: its steps and their labels, the
 * guided and unguided flows, which state enables Back, Next and Finish, how it finishes,
 * useCrudImportLogic (the hook SCF's own layout builds on), and the wizard's accessibility.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { LOAD, renderPlain, setupCrudTests } from "./crudFixture";
import {
	importModel,
	PEOPLE,
	pickFile,
	wizardEl,
	xlsxFile,
} from "./importFixture";

setupCrudTests();

const next = () => screen.getByRole("button", { name: "Next" });
const back = () => screen.getByRole("button", { name: "Back" });

/** Picks the PEOPLE file and waits until it is read (Next enabled) */
const upload = async (container: HTMLElement, rows: unknown[][] = PEOPLE) => {
	pickFile(container, xlsxFile([["Data", rows]]));
	await waitFor(() => expect(next()).toBeEnabled(), LOAD);
};

describe("CrudImport: bugs", () => {
	it("[ISSUE-3508-ITEM-22] picking another file on the upload step replaces the first", async () => {
		const { container } = renderPlain(wizardEl(importModel()));
		await screen.findByText("Upload data", undefined, LOAD);
		await upload(container);
		pickFile(container, xlsxFile([["Data", [["n"], ["Carol"]]]], "other.xlsx"));
		await waitFor(
			() =>
				expect(
					screen.getAllByText(/other\.xlsx|Invalid file selected/).length,
				).toBeGreaterThan(0),
			{ timeout: 3000 },
		);
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(screen.queryByText("people.xlsx")).toBeNull();
	});

	it("[ISSUE-3508-ITEM-22] the replacing file is listed at once, its rows replace the first file's, and Next waits for them", async () => {
		const { container } = renderPlain(wizardEl(importModel()));
		await screen.findByText("Upload data", undefined, LOAD);
		await upload(container);
		expect(await screen.findByText("Alice", undefined, LOAD)).toBeVisible();
		pickFile(container, xlsxFile([["Data", [["n"], ["Carol"]]]], "other.xlsx"));
		// still being read: listed, without the first file's rows, and no Next with them
		expect(screen.getByText("other.xlsx")).toBeInTheDocument();
		expect(screen.queryByText("people.xlsx")).toBeNull();
		expect(screen.queryByText("Alice")).toBeNull();
		expect(next()).toBeDisabled();
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		expect(await screen.findByText("Carol", undefined, LOAD)).toBeVisible();
		expect(screen.queryByText("Alice")).toBeNull();
		expect(screen.getByText("other.xlsx")).toBeInTheDocument();
		expect(screen.queryByText("people.xlsx")).toBeNull();
	});

	it("[ISSUE-3508-ITEM-22] Upload opens the file picker while a file is listed", async () => {
		const { container } = renderPlain(wizardEl(importModel()));
		await screen.findByText("Upload data", undefined, LOAD);
		await upload(container);
		const input =
			container.querySelector<HTMLInputElement>("input[type=file]")!;
		// one file at a time, also in the browser's picker
		expect(input.multiple).toBe(false);
		const openPicker = vi.spyOn(input, "click").mockImplementation(() => {});
		fireEvent.click(screen.getByRole("button", { name: "Upload" }));
		expect(openPicker).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("[ISSUE-3508-ITEM-22] refuses two files dropped at once with a title that names the count, and keeps the listed file", async () => {
		const { container } = renderPlain(wizardEl(importModel()));
		await screen.findByText("Upload data", undefined, LOAD);
		await upload(container);
		fireEvent.drop(container.querySelector(".components-care-dropzone")!, {
			dataTransfer: {
				files: [
					xlsxFile([["Data", [["n"], ["Carol"]]]], "other.xlsx"),
					xlsxFile([["Data", [["n"], ["Dave"]]]], "third.xlsx"),
				],
			},
		});
		const dialog = await screen.findByRole("dialog", undefined, LOAD);
		expect(dialog).toHaveAccessibleName("Only one file can be imported");
		expect(dialog).toHaveTextContent("Too many files selected");
		fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(screen.getByText("people.xlsx")).toBeInTheDocument();
		expect(screen.queryByText("other.xlsx")).toBeNull();
		expect(next()).toBeEnabled();
	});

	it("[ISSUE-3508-ITEM-22] refuses a file of another type as 'Invalid file selected', and keeps the listed file", async () => {
		const { container } = renderPlain(wizardEl(importModel()));
		await screen.findByText("Upload data", undefined, LOAD);
		await upload(container);
		pickFile(container, new File(["a;b\n1;2\n"], "data.csv"));
		const dialog = await screen.findByRole("dialog", undefined, LOAD);
		expect(dialog).toHaveAccessibleName("Invalid file selected");
		expect(dialog).toHaveTextContent("Unsupported file type selected");
		fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(screen.getByText("people.xlsx")).toBeInTheDocument();
		expect(next()).toBeEnabled();
	});

	it("[ISSUE-3508-ITEM-22] Back from the review, a new pick replaces the file and the review checks its rows", async () => {
		const { container } = renderPlain(
			wizardEl(importModel(), {
				initialView: "import",
				importConfig: {
					first_name: (r: Record<string, unknown>) => r.n,
					email: (r: Record<string, unknown>) => r.mail,
				},
			}),
		);
		await screen.findByText("Upload data", undefined, LOAD);
		await upload(container);
		fireEvent.click(next());
		expect(await screen.findByText("Alice", undefined, LOAD)).toBeVisible();
		fireEvent.click(back());
		expect(
			await screen.findByText("people.xlsx", undefined, LOAD),
		).toBeVisible();
		pickFile(
			container,
			xlsxFile(
				[
					[
						"Data",
						[
							["n", "mail"],
							["Carol", "carol@example.com"],
						],
					],
				],
				"corrected.xlsx",
			),
		);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(screen.getByText("corrected.xlsx")).toBeInTheDocument();
		expect(screen.queryByText("people.xlsx")).toBeNull();
		fireEvent.click(next());
		expect(await screen.findByText("Carol", undefined, LOAD)).toBeVisible();
		expect(screen.queryByText("Alice")).toBeNull();
	});
});
