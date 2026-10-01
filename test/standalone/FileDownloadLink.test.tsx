import React from "react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	MockInstance,
	vi,
} from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import File, { FileProps } from "../../src/standalone/FileUpload/Generic/File";
import ObjectUrlLink from "../../src/standalone/FileUpload/Generic/ObjectUrlLink";

const theme = createTheme();

let nextUrl = 0;
let revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;
let open: MockInstance<typeof window.open>;

beforeEach(() => {
	nextUrl = 0;
	vi.spyOn(URL, "createObjectURL").mockImplementation(
		() => `blob:url-${nextUrl++}`,
	);
	revokeObjectURL = vi
		.spyOn(URL, "revokeObjectURL")
		.mockImplementation(() => undefined);
	open = vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const renderFile = (props: Partial<FileProps>) =>
	render(
		<ThemeProvider theme={theme}>
			<File
				name={"notes.txt"}
				mimeType={"text/plain"}
				size={24}
				disabled={false}
				variant={"list"}
				{...props}
			/>
		</ThemeProvider>,
	);

describe("File download link", () => {
	it("opens a URL as it is", async () => {
		renderFile({ downloadLink: "https://x/notes.txt" });
		fireEvent.click(screen.getByText("notes.txt"));
		await waitFor(() =>
			expect(open).toHaveBeenCalledWith("https://x/notes.txt", "_blank"),
		);
	});

	it("opens a Blob through an object URL that lives as long as the file", async () => {
		const blob = new Blob(["x"], { type: "text/plain" });
		const { unmount } = renderFile({ downloadLink: blob });
		fireEvent.click(screen.getByText("notes.txt"));
		await waitFor(() =>
			expect(open).toHaveBeenCalledWith("blob:url-0", "_blank"),
		);
		expect(revokeObjectURL).not.toHaveBeenCalled();
		unmount();
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:url-0");
	});

	it("hands a Blob's object URL to a custom click handler", async () => {
		const onClick = vi.fn();
		renderFile({
			downloadLink: new Blob(["x"], { type: "text/plain" }),
			onClick,
		});
		fireEvent.click(screen.getByText("notes.txt"));
		await waitFor(() =>
			expect(onClick).toHaveBeenCalledWith("notes.txt", "blob:url-0"),
		);
		expect(open).not.toHaveBeenCalled();
	});

	it("marks a file with a Blob link as openable", () => {
		renderFile({ downloadLink: new Blob(["x"], { type: "text/plain" }) });
		expect(screen.getByText("notes.txt")).toHaveClass("Mui-active");
	});
});

describe("ObjectUrlLink", () => {
	it("links a Blob through an object URL, revoked on unmount", () => {
		const { unmount } = render(
			<ObjectUrlLink href={new Blob(["x"])}>notes.txt</ObjectUrlLink>,
		);
		expect(screen.getByRole("link")).toHaveAttribute("href", "blob:url-0");
		unmount();
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:url-0");
	});

	it("links a URL as it is", () => {
		render(
			<ObjectUrlLink href={"https://x/notes.txt"}>notes.txt</ObjectUrlLink>,
		);
		expect(screen.getByRole("link")).toHaveAttribute(
			"href",
			"https://x/notes.txt",
		);
	});
});
