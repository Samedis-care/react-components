import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Framework } from "../../src/framework";
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

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const stored = (
	name: string,
	extra?: Partial<FileData<FileMeta>>,
): FileData<FileMeta> => ({
	file: {
		name,
		type: "application/pdf",
		downloadLink: "https://example.com/" + name,
	},
	...extra,
});

const renderUpload = (props?: Partial<FileUploadProps>) =>
	render(
		<Framework>
			<FileUpload previewSize={24} handleError={() => {}} {...props} />
		</Framework>,
	);

describe("FileUpload — accessible names and roles", () => {
	it("[ISSUE-3489-ITEM-2] modern: a named button opens the picker and carries name and onBlur", () => {
		const onBlur = vi.fn();
		const click = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		renderUpload({ variant: "modern", name: "docs", onBlur });
		const btn = screen.getByRole("button", { name: /drag|upload|click/i });
		expect(btn).toHaveAttribute("name", "docs");
		fireEvent.click(btn);
		expect(click).toHaveBeenCalledTimes(1);
		fireEvent.blur(btn);
		expect(onBlur).toHaveBeenCalledTimes(1);
	});
	it("[ISSUE-3489-ITEM-2] modern: the upload button is named by its visible text, also by uploadLabel, and does not submit a form", () => {
		const onSubmit = vi.fn((evt: React.FormEvent) => evt.preventDefault());
		render(
			<Framework>
				<form onSubmit={onSubmit}>
					<FileUpload
						previewSize={24}
						handleError={() => {}}
						variant={"modern"}
					/>
				</form>
			</Framework>,
		);
		const btn = screen.getByRole("button", {
			name: "Drag & drop file here or click for an upload dialog",
		});
		expect(btn).toHaveAttribute("type", "button");
		vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
		fireEvent.click(btn);
		expect(onSubmit).not.toHaveBeenCalled();
		cleanup();
		renderUpload({ variant: "modern", uploadLabel: "Attach documents" });
		expect(
			screen.getByRole("button", { name: "Attach documents" }),
		).toBeInTheDocument();
	});
	it("[ISSUE-3489-ITEM-2] modern: read-only offers no upload button", () => {
		renderUpload({ variant: "modern", readOnly: true });
		expect(screen.queryByRole("button")).toBe(null);
	});
	it("[ISSUE-3489-ITEM-3] each file with a link is one link or button named by its file name", () => {
		for (const variant of ["classic", "modern"] as const) {
			renderUpload({
				variant,
				readOnly: true,
				files: [
					stored("a.pdf"),
					{ file: { name: "b.pdf", type: "application/pdf" } },
				],
			});
			const controls = (name: RegExp) => [
				...screen.queryAllByRole("link", { name }),
				...screen.queryAllByRole("button", { name }),
			];
			expect(controls(/a\.pdf/), variant).toHaveLength(1);
			// nothing to open
			expect(controls(/b\.pdf/), variant).toHaveLength(0);
			cleanup();
		}
	});
	it("[ISSUE-3489-ITEM-3] modern: opening a file opens no file picker", () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		const click = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		renderUpload({ variant: "modern", files: [stored("a.pdf")] });
		fireEvent.click(screen.getByRole("link", { name: "a.pdf" }));
		expect(open).toHaveBeenCalledTimes(1);
		expect(click).not.toHaveBeenCalled();
	});
	it("[ISSUE-3489-ITEM-4] remove and restore are buttons that name their file", () => {
		for (const variant of ["classic", "modern"] as const) {
			renderUpload({
				variant,
				files: [stored("a.pdf"), stored("b.pdf", { delete: true })],
			});
			expect(
				screen.getByRole("button", {
					name: (n) => /remove/i.test(n) && n.includes("a.pdf"),
				}),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", {
					name: (n) => /restore/i.test(n) && n.includes("b.pdf"),
				}),
			).toBeInTheDocument();
			cleanup();
		}
	});
	it("[ISSUE-3489-ITEM-4] keyboard focus stays with the file's button after a remove, and moves on when a removed pick leaves the list", () => {
		const picked = (name: string): FileData => ({
			file: new File(["x"], name),
			canBeUploaded: true,
		});
		const press = (name: string) => {
			const btn = screen.getByRole("button", { name });
			btn.focus();
			fireEvent.click(btn);
		};
		for (const [variant, upload] of [
			["classic", "Upload"],
			["modern", "Drag & drop file here or click for an upload dialog"],
		] as const) {
			renderUpload({
				variant,
				files: [picked("a.txt"), stored("b.pdf"), picked("c.txt")],
			});
			// a stored file stays listed: its button turns into the restore
			press("Remove b.pdf");
			expect(document.activeElement, variant).toBe(
				screen.getByRole("button", { name: "Restore b.pdf" }),
			);
			// a pick leaves: on to the next file's button
			press("Remove a.txt");
			expect(screen.queryByText("a.txt"), variant).toBe(null);
			expect(document.activeElement, variant).toBe(
				screen.getByRole("button", { name: "Restore b.pdf" }),
			);
			// the last file: on to the upload control
			press("Remove c.txt");
			expect(screen.queryByText("c.txt"), variant).toBe(null);
			expect(document.activeElement, variant).toBe(
				screen.getByRole("button", { name: upload }),
			);
			cleanup();
		}
	});
	it("[ISSUE-3489-ITEM-4] a remove by mouse, with focus elsewhere, does not move focus", () => {
		render(
			<Framework>
				<input aria-label={"elsewhere"} />
				<FileUpload
					previewSize={24}
					handleError={() => {}}
					files={[
						{ file: new File(["x"], "a.txt"), canBeUploaded: true },
						stored("b.pdf"),
					]}
				/>
			</Framework>,
		);
		const elsewhere = screen.getByRole("textbox", { name: "elsewhere" });
		elsewhere.focus();
		fireEvent.click(screen.getByRole("button", { name: "Remove a.txt" }));
		expect(screen.queryByText("a.txt")).toBe(null);
		expect(document.activeElement).toBe(elsewhere);
	});
});
