import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Framework } from "../../src/framework";
import FileUpload, {
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
});
