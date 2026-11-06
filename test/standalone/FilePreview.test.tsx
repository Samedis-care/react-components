import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import FilePreview, {
	FileProps,
} from "../../src/standalone/FileUpload/Generic/File";

const theme = createTheme();

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const renderFile = (p: Partial<FileProps>) =>
	render(
		<ThemeProvider theme={theme}>
			<FilePreview
				name={"notes.txt"}
				mimeType={"text/plain"}
				size={24}
				disabled={false}
				variant={"list"}
				{...p}
			/>
		</ThemeProvider>,
	);

describe("FilePreview — opening a file", () => {
	it("[ISSUE-3489-ITEM-1] never opens a javascript: link", async () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		renderFile({ downloadLink: "javascript:alert(document.cookie)" });
		fireEvent.click(screen.getByText("notes.txt"));
		// openDownload is async: give it the chance to run
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(open.mock.calls.map((c) => String(c[0]))).not.toContainEqual(
			expect.stringMatching(/^\s*javascript:/i),
		);
	});

	// the scheme is read the way the browser reads it: case-insensitive, after leading
	// spaces and control characters, with tabs and newlines removed anywhere
	it.each([
		["JavaScript:alert(1)"],
		[" \u0001javascript:alert(1)"],
		["java\tscr\nipt:alert(1)"],
		["vbscript:msgbox(1)"],
		["file:///etc/passwd"],
		["http://exa mple.com/"],
	])(
		"[ISSUE-3489-ITEM-1] %j is no link: not openable, not opened, not handed to onClick",
		async (downloadLink) => {
			const open = vi.spyOn(window, "open").mockImplementation(() => null);
			const onClick = vi.fn();
			const clickNameAndIcon = async (container: HTMLElement) => {
				fireEvent.click(screen.getByText("notes.txt"));
				fireEvent.click(container.querySelector("svg")!);
				await act(async () => {
					await new Promise((resolve) => setTimeout(resolve, 0));
				});
			};
			let { container } = renderFile({ downloadLink });
			expect(screen.getByText("notes.txt")).not.toHaveClass("Mui-active");
			expect(container.querySelector(".Mui-active")).toBe(null);
			await clickNameAndIcon(container);
			expect(open).not.toHaveBeenCalled();
			cleanup();
			({ container } = renderFile({ downloadLink, onClick }));
			await clickNameAndIcon(container);
			expect(onClick).not.toHaveBeenCalled();
		},
	);

	it.each([
		["https://x/notes.txt"],
		["http://x/notes.txt"],
		["/api/files/notes.txt"],
	])(
		"[ISSUE-3489-ITEM-1] opens %j in a new tab without access to the app window",
		async (downloadLink) => {
			const open = vi.spyOn(window, "open").mockImplementation(() => null);
			renderFile({ downloadLink });
			expect(screen.getByText("notes.txt")).toHaveClass("Mui-active");
			fireEvent.click(screen.getByText("notes.txt"));
			await waitFor(() =>
				expect(open).toHaveBeenCalledWith(
					downloadLink,
					"_blank",
					"noopener,noreferrer",
				),
			);
		},
	);

	it("[ISSUE-3489-ITEM-1] opens a data link as an object URL without access to the app window", async () => {
		vi.spyOn(URL, "createObjectURL").mockImplementation(() => "blob:d");
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		renderFile({ downloadLink: "data:text/plain;base64,aGVsbG8=" });
		fireEvent.click(screen.getByText("notes.txt"));
		await waitFor(() =>
			expect(open).toHaveBeenCalledWith(
				"blob:d",
				"_blank",
				"noopener,noreferrer",
			),
		);
	});
});
