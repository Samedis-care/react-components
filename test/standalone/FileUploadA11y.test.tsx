import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React, { useContext, useRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Framework } from "../../src/framework";
import FileUpload, {
	FileData,
	FileMeta,
	FileUploadProps,
	FileUploadRendererProps,
} from "../../src/standalone/FileUpload/Generic";
import FilePreview from "../../src/standalone/FileUpload/Generic/File";
import { useFileActionButtonFocus } from "../../src/standalone/FileUpload";

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
		for (const variant of ["classic", "modern"] as const) {
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
			// the last file: back to the previous file's button
			press("Remove c.txt");
			expect(screen.queryByText("c.txt"), variant).toBe(null);
			expect(document.activeElement, variant).toBe(
				screen.getByRole("button", { name: "Restore b.pdf" }),
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

const pick = (name: string): FileData => ({
	file: new File(["x"], name),
	canBeUploaded: true,
});

/** Focuses a file's remove button and activates it, as Enter does */
const removeByKeyboard = (name: string) => {
	const btn = screen.getByRole("button", { name });
	btn.focus();
	fireEvent.click(btn);
};

/** The element a custom variant hands focus to after the last file, if not its own button */
const OutsideFallbackContext = React.createContext<
	React.RefObject<HTMLElement | null> | undefined
>(undefined);

/**
 * A custom variant as an app writes one: its own upload button and the files as a list,
 * each keyed by its name (unique in these tests), without a restore button
 */
const CustomVariant = (props: FileUploadRendererProps) => {
	const { files, removeFile, handleUpload, previewSize } = props;
	const outside = useContext(OutsideFallbackContext);
	const uploadRef = useRef<HTMLButtonElement>(null);
	const getActionButtonRef = useFileActionButtonFocus(outside ?? uploadRef);
	return (
		<div>
			<button type={"button"} ref={uploadRef} onClick={() => handleUpload()}>
				Add files
			</button>
			{files.map((data, index) => (
				<FilePreview
					key={data.file.name}
					name={data.file.name}
					mimeType={data.file.type}
					size={previewSize}
					disabled={!!data.delete}
					onRemove={() => removeFile(data)}
					actionButtonRef={getActionButtonRef(index)}
					variant={"compact-list"}
				/>
			))}
		</div>
	);
};

describe("FileUpload — keyboard focus when a file's button goes away", () => {
	it("[FOLLOWUP-FILE-UPLOAD-CUSTOM-FOCUS] built-in variants: after the last file focus steps back to the previous file's button, and goes to the upload control once no file's button is left", () => {
		for (const [variant, upload] of [
			["classic", "Upload"],
			["modern", "Drag & drop file here or click for an upload dialog"],
		] as const) {
			renderUpload({
				variant,
				files: [
					pick("a.txt"),
					stored("locked.pdf", { preventDelete: true }),
					pick("c.txt"),
				],
			});
			// locked.pdf has no button, so the previous one with a button is a.txt's
			removeByKeyboard("Remove c.txt");
			expect(screen.queryByText("c.txt"), variant).toBe(null);
			expect(document.activeElement, variant).toBe(
				screen.getByRole("button", { name: "Remove a.txt" }),
			);
			removeByKeyboard("Remove a.txt");
			expect(screen.queryByText("a.txt"), variant).toBe(null);
			expect(document.activeElement, variant).toBe(
				screen.getByRole("button", { name: upload }),
			);
			cleanup();
		}
	});
	it("[FOLLOWUP-FILE-UPLOAD-CUSTOM-FOCUS] a custom variant with useFileActionButtonFocus: focus moves to the next file's button, after the last file to the previous one, and then to the variant's upload button", () => {
		renderUpload({
			variant: CustomVariant,
			files: [pick("a.txt"), pick("b.txt"), pick("c.txt")],
		});
		// the middle file: on to the next one
		removeByKeyboard("Remove b.txt");
		expect(screen.queryByText("b.txt")).toBe(null);
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Remove c.txt" }),
		);
		// the last file: back to the previous one
		removeByKeyboard("Remove c.txt");
		expect(screen.queryByText("c.txt")).toBe(null);
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Remove a.txt" }),
		);
		// no file's button left: the element the variant named
		removeByKeyboard("Remove a.txt");
		expect(screen.queryByText("a.txt")).toBe(null);
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Add files" }),
		);
	});
	it("[FOLLOWUP-FILE-UPLOAD-CUSTOM-FOCUS] the element a custom variant names for after the last file may lie outside it", () => {
		const Owner = () => {
			const attachRef = useRef<HTMLButtonElement>(null);
			return (
				<Framework>
					<OutsideFallbackContext.Provider value={attachRef}>
						<FileUpload
							previewSize={24}
							handleError={() => {}}
							variant={CustomVariant}
							files={[pick("a.txt")]}
						/>
					</OutsideFallbackContext.Provider>
					<button type={"button"} ref={attachRef}>
						Attach
					</button>
				</Framework>
			);
		};
		render(<Owner />);
		removeByKeyboard("Remove a.txt");
		expect(screen.queryByText("a.txt")).toBe(null);
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Attach" }),
		);
	});
	it("[FOLLOWUP-FILE-UPLOAD-CUSTOM-FOCUS] a custom variant's remove by mouse, with focus elsewhere, does not move focus", () => {
		render(
			<Framework>
				<input aria-label={"elsewhere"} />
				<FileUpload
					previewSize={24}
					handleError={() => {}}
					variant={CustomVariant}
					files={[pick("a.txt"), pick("b.txt")]}
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
