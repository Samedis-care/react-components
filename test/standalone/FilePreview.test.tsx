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

describe("FilePreview — the control that opens a file", () => {
	/** The elements a keyboard user can reach, or that claim a control's role */
	const controls = (container: HTMLElement) =>
		container.querySelectorAll("a, button, [tabindex], [role]");

	it.each([["box"], ["list"], ["compact-list"]] as const)(
		"[ISSUE-3489-ITEM-3] %s: the name of a file with a link is the one link, opening it in a new tab once",
		async (variant) => {
			const open = vi.spyOn(window, "open").mockImplementation(() => null);
			const { container } = renderFile({
				variant,
				downloadLink: "https://x/notes.txt",
			});
			const link = screen.getByRole("link", { name: "notes.txt" });
			expect(link).toHaveTextContent("notes.txt");
			expect(link).toHaveAttribute("href", "https://x/notes.txt");
			expect(link).toHaveAttribute("target", "_blank");
			expect(link.getAttribute("rel")?.split(" ")).toEqual(
				expect.arrayContaining(["noopener", "noreferrer"]),
			);
			expect([...controls(container)]).toEqual([link]);
			// the file is opened by the click handler, not by the browser as well
			expect(fireEvent.click(link)).toBe(false);
			await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
			expect(open).toHaveBeenCalledWith(
				"https://x/notes.txt",
				"_blank",
				"noopener,noreferrer",
			);
			// the icon still opens it by mouse
			fireEvent.click(container.querySelector("svg")!);
			await waitFor(() => expect(open).toHaveBeenCalledTimes(2));
		},
	);

	it("[ISSUE-3489-ITEM-3] links a Blob through its object URL", () => {
		vi.spyOn(URL, "createObjectURL").mockImplementation(() => "blob:notes");
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
		renderFile({ downloadLink: new Blob(["x"], { type: "text/plain" }) });
		expect(screen.getByRole("link", { name: "notes.txt" })).toHaveAttribute(
			"href",
			"blob:notes",
		);
	});

	it("[ISSUE-3489-ITEM-3] with onClick the name is a button that calls it instead of opening the link", async () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		const onClick = vi.fn();
		const { container } = renderFile({
			variant: "compact-list",
			label: "TXT",
			downloadLink: "https://x/notes.txt",
			onClick,
		});
		const button = screen.getByRole("button", { name: "notes.txt" });
		expect(button).toHaveTextContent("TXT");
		expect(button).toHaveAttribute("type", "button");
		expect(screen.queryByRole("link")).toBe(null);
		expect([...controls(container)]).toEqual([button]);
		fireEvent.click(button);
		await waitFor(() =>
			expect(onClick).toHaveBeenCalledWith("notes.txt", "https://x/notes.txt"),
		);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(open).not.toHaveBeenCalled();
	});

	it("[ISSUE-3489-ITEM-3] icon-only: the icon is the link, named by the file name, and a click on it opens the file once", async () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		const { container } = renderFile({
			variant: "icon-only",
			downloadLink: "https://x/notes.txt",
		});
		const link = screen.getByRole("link", { name: "notes.txt" });
		expect(link).toContainElement(container.querySelector("svg"));
		expect([...controls(container)]).toEqual([link]);
		fireEvent.click(container.querySelector("svg")!);
		await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(open).toHaveBeenCalledTimes(1);
	});

	it.each([
		["no link", undefined],
		["a javascript: link", "javascript:alert(1)"],
	])(
		"[ISSUE-3489-ITEM-3] a file with %s has no control",
		(_what, downloadLink) => {
			for (const variant of [
				"box",
				"list",
				"compact-list",
				"icon-only",
			] as const) {
				const { container } = renderFile({ variant, downloadLink });
				expect(controls(container), variant).toHaveLength(0);
				cleanup();
			}
		},
	);
});
