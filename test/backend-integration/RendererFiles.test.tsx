import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import RendererFiles from "../../src/backend-integration/Model/Types/Renderers/RendererFiles";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import type { FileData } from "../../src/standalone/FileUpload/Generic";
import ccI18n from "../../src/i18n";

/**
 * The files renderer (ModelDataTypeFilesRenderer) in a grid cell: one line, without a
 * list, with a count and a menu for more than one file.
 */

beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
	await ccI18n.loadLanguages(["ru"]);
});

afterEach(async () => {
	cleanup();
	vi.restoreAllMocks();
	await ccI18n.changeLanguage("en");
});

const file = (name: string, downloadLink?: string): FileData => ({
	file: { name, type: "application/pdf", downloadLink },
});

const CONTRACT = file("contract.pdf", "https://example.invalid/contract.pdf");
const ANNEX = file("annex.pdf", "https://example.invalid/annex.pdf");

const gridParams = (value: FileData[]): ModelRenderParams<FileData[]> => ({
	field: "files",
	value,
	initialValue: value,
	label: "Files",
	touched: false,
	dirty: false,
	autoFocus: false,
	visibility: {
		disabled: false,
		hidden: false,
		editable: false,
		readOnly: true,
		required: false,
		grid: true,
	},
	handleChange: vi.fn(),
	handleBlur: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	setFieldTouched: vi.fn(),
	values: {},
});

/**
 * Renders the grid cell's content in a stand-in for the cell, which selects the row on
 * click and opens the record on double click
 */
const renderCell = (value: FileData[], theme: Theme = createTheme()) => {
	const onCellClick = vi.fn();
	const onCellDoubleClick = vi.fn();
	const result = render(
		<ThemeProvider theme={theme}>
			<div onClick={onCellClick} onDoubleClick={onCellDoubleClick}>
				{new RendererFiles().render(gridParams(value))}
			</div>
		</ThemeProvider>,
	);
	return { ...result, onCellClick, onCellDoubleClick };
};

/** The part of a locale's translation.json with the files renderer's texts */
interface FilesTranslation {
	"backend-integration": {
		model: { types: { renderers: { files: Record<string, string> } } };
	};
}

describe("RendererFiles in a grid cell", () => {
	it("[ISSUE-3506-ITEM-13] shows no files as one line of text, without a list", () => {
		const { container } = renderCell([]);
		expect(container).toHaveTextContent("No files present");
		expect(screen.queryByRole("list")).toBeNull();
		expect(container.querySelector("ul, li")).toBeNull();
	});

	it("[ISSUE-3506-ITEM-13] shows the only file as a link that opens it in a new tab", () => {
		renderCell([CONTRACT]);
		const link = screen.getByRole("link", { name: "contract.pdf" });
		expect(link).toHaveAttribute(
			"href",
			"https://example.invalid/contract.pdf",
		);
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.queryByRole("list")).toBeNull();
		expect(screen.queryByRole("button")).toBeNull();
	});

	it("[ISSUE-3506-ITEM-13] shows the only file without a usable link by its name", () => {
		const { container } = renderCell([
			file("notes.txt", "javascript:alert(1)"),
		]);
		expect(container).toHaveTextContent("notes.txt");
		expect(screen.queryByRole("link")).toBeNull();
	});

	it("[ISSUE-3506-ITEM-13] links the only file by an object URL when its link is a Blob", async () => {
		vi.spyOn(URL, "createObjectURL").mockImplementation(() => "blob:url-1");
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
		renderCell([
			{
				file: {
					name: "queued.pdf",
					type: "application/pdf",
					downloadLink: new Blob(["%PDF"]),
				},
			},
		]);
		expect(
			await screen.findByRole("link", { name: "queued.pdf" }),
		).toHaveAttribute("href", "blob:url-1");
	});

	it("[ISSUE-3506-ITEM-13] shows several files as their count, a button that opens a menu of the files", async () => {
		const { container } = renderCell([
			CONTRACT,
			ANNEX,
			file("draft.pdf", undefined),
		]);
		expect(container.querySelector("ul, li")).toBeNull();
		expect(screen.queryByRole("link")).toBeNull();
		const button = screen.getByRole("button", { name: "3 files" });
		expect(button).toHaveAttribute("aria-haspopup", "menu");
		expect(button).toHaveAttribute("aria-expanded", "false");

		fireEvent.click(button);
		const menu = await screen.findByRole("menu", { name: "3 files" });
		expect(button).toHaveAttribute("aria-expanded", "true");
		expect(button).toHaveAttribute("aria-controls", menu.id);
		const items = within(menu).getAllByRole("menuitem");
		expect(items.map((item) => item.textContent)).toEqual([
			"contract.pdf",
			"annex.pdf",
			"draft.pdf",
		]);
		expect(items[0]).toHaveAttribute(
			"href",
			"https://example.invalid/contract.pdf",
		);
		expect(items[0]).toHaveAttribute("target", "_blank");
		expect(items[0]).toHaveAttribute("rel", "noopener noreferrer");
		expect(items[1]).toHaveAttribute(
			"href",
			"https://example.invalid/annex.pdf",
		);
		// no link: listed by its name, not actionable
		expect(items[2]).not.toHaveAttribute("href");
		expect(items[2]).toHaveAttribute("aria-disabled", "true");
	});

	it("[ISSUE-3506-ITEM-13] closes the menu when a file is opened from it", async () => {
		renderCell([CONTRACT, ANNEX]);
		fireEvent.click(screen.getByRole("button", { name: "2 files" }));
		const menu = await screen.findByRole("menu");
		fireEvent.click(within(menu).getByRole("menuitem", { name: "annex.pdf" }));
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		expect(screen.getByRole("button", { name: "2 files" })).toHaveAttribute(
			"aria-expanded",
			"false",
		);
	});

	it("[ISSUE-3506-ITEM-13] acts on the files only: neither the link, the button nor the menu select the row or open the record", async () => {
		const single = renderCell([CONTRACT]);
		const link = screen.getByRole("link", { name: "contract.pdf" });
		fireEvent.click(link);
		fireEvent.doubleClick(link);
		expect(single.onCellClick).not.toHaveBeenCalled();
		expect(single.onCellDoubleClick).not.toHaveBeenCalled();
		cleanup();

		const several = renderCell([CONTRACT, ANNEX]);
		const button = screen.getByRole("button", { name: "2 files" });
		fireEvent.doubleClick(button);
		fireEvent.click(button);
		const menu = await screen.findByRole("menu");
		const item = within(menu).getByRole("menuitem", { name: "contract.pdf" });
		fireEvent.doubleClick(item);
		fireEvent.click(item);
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		// a click next to the menu closes it
		fireEvent.click(button);
		const reopened = await screen.findByRole("menu");
		const backdrop = reopened.closest(".MuiPopover-root")!.firstElementChild!;
		fireEvent.click(backdrop);
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		expect(several.onCellClick).not.toHaveBeenCalled();
		expect(several.onCellDoubleClick).not.toHaveBeenCalled();
	});

	it("[ISSUE-3506-ITEM-13] applies the theme's style overrides of CcFilesGrid to the line and the count's button", () => {
		const themed = createTheme({
			components: {
				CcFilesGrid: {
					styleOverrides: {
						root: { backgroundColor: "rgb(1, 2, 3)" },
						menuButton: { backgroundColor: "rgb(4, 5, 6)" },
					},
				},
			},
		});
		const { container } = renderCell([CONTRACT, ANNEX], themed);
		const button = screen.getByRole("button", { name: "2 files" });
		const line = container.firstElementChild!.firstElementChild!;
		expect(line).toContainElement(button);
		expect(getComputedStyle(line).backgroundColor).toBe("rgb(1, 2, 3)");
		expect(getComputedStyle(button).backgroundColor).toBe("rgb(4, 5, 6)");
	});

	it("[ISSUE-3506-ITEM-13] counts by the plural rules of the language", async () => {
		await act(() => ccI18n.changeLanguage("ru"));
		const names = [2, 5, 21].map((count) => {
			const files = Array.from({ length: count }, (_, index) =>
				file(`file-${index}.pdf`, `https://example.invalid/${index}.pdf`),
			);
			const { container } = renderCell(files);
			const name = within(container).getByRole("button").textContent;
			cleanup();
			return name;
		});
		expect(names).toEqual(["2 файла", "5 файлов", "21 файл"]);
	});

	it("[ISSUE-3506-ITEM-13] has the count in every locale, for each of its plural forms", () => {
		const i18nDir = path.resolve(__dirname, "../../src/assets/i18n");
		const missing = fs
			.readdirSync(i18nDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.flatMap((entry) => {
				const translation = JSON.parse(
					fs.readFileSync(
						path.join(i18nDir, entry.name, "translation.json"),
						"utf8",
					),
				) as FilesTranslation;
				const files =
					translation["backend-integration"].model.types.renderers.files;
				return new Intl.PluralRules(entry.name)
					.resolvedOptions()
					.pluralCategories.filter(
						(category) => !files[`count_${category}`]?.includes("{{count}}"),
					)
					.map((category) => `${entry.name}: count_${category}`);
			});
		expect(missing).toEqual([]);
	});
});
