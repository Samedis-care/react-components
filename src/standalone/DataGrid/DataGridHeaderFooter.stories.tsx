import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Box, Grid } from "@mui/material";
import { DataGrid, DataGridNoPersist } from "./index";
import type {
	DataGridData,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "./DataGrid";
import type { IDataGridExporter } from "./Header";

// ─── Sample data ────────────────────────────────────────────────────────────

const PEOPLE = [
	"Alice Müller",
	"Bob Smith",
	"Carol Jones",
	"Dave Brown",
	"Eve Davis",
	"Frank Wilson",
].map((name, i) => ({
	id: String(i + 1),
	name,
	role: i % 2 ? "user" : "admin",
}));

/** Applies the search to the names; the counts say 1234 people in total */
const loadPeople = ({
	page,
	rows,
	quickFilter,
}: IDataGridLoadDataParameters): DataGridData => {
	const data = PEOPLE.filter((person) =>
		person.name.toLowerCase().includes(quickFilter.toLowerCase()),
	);
	return {
		rowsTotal: 1234,
		rowsFiltered: quickFilter ? data.length : 567,
		rows: data.slice((page - 1) * rows, page * rows),
	};
};

const COLUMNS: IDataGridColumnDef[] = [
	{
		field: "name",
		headerName: "Name",
		type: "string",
		filterable: true,
		sortable: true,
	},
	{
		field: "role",
		headerName: "Role",
		type: "string",
		filterable: true,
		sortable: true,
	},
	{
		field: "id",
		headerName: "ID",
		type: "string",
		forcePin: true,
	},
];

/** An exporter whose request takes 100ms */
const EXCEL: IDataGridExporter<unknown> = {
	id: "xlsx",
	getLabel: () => "Excel",
	getWorkingLabel: () => "Exporting…",
	getReadyLabel: () => "Download",
	getErrorLabel: () => "Export failed",
	onRequest: () =>
		new Promise((resolve) => setTimeout(() => resolve("file.xlsx"), 100)),
	onDownload: () => {},
};

/** A filter bar: on phones it turns the header's buttons into "More options" */
const SimpleFilterBar = () => (
	<Grid size={12}>
		<span>Filters</span>
	</Grid>
);

const PHONE = { viewport: { value: "mobile1", isRotated: false } };

/**
 * ISSUE-3495-ITEM-17: asserts the library's keyboard focus ring on an element: a
 * 2px solid outline in the theme's primary.main (the default theme's, 4.6:1
 * against white), at least minOffset px outside the element
 */
const expectFocusRing = async (element: Element, minOffset: number) => {
	const style = getComputedStyle(element);
	await expect(style.outlineStyle, "no outline").toBe("solid");
	await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
	await expect(style.outlineColor).toBe("rgb(25, 118, 210)");
	await expect(parseFloat(style.outlineOffset)).toBeGreaterThanOrEqual(
		minOffset,
	);
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

/**
 * The parts of the DataGrid around the rows: the header (search, filter bar,
 * the "Columns", "Reset", "Export" and "Import" buttons, the add buttons), the
 * footer (select all, Edit, Delete, the custom actions, the row counts) and the
 * column settings panel that "Columns" opens. Their props are DataGrid props.
 */
const meta: Meta<typeof DataGrid> = {
	title: "Standalone/DataGrid/Header and Footer",
	component: DataGrid,
	decorators: [
		(Story) => (
			<Box sx={{ height: 500 }}>
				<DataGridNoPersist>
					<Story />
				</DataGridNoPersist>
			</Box>
		),
	],
	parameters: { layout: "fullscreen" },
	argTypes: {
		exporters: {
			description:
				"The Export menu's entries (IDataGridExporter). A click requests the export, a click on the ready entry downloads it.",
		},
		onImport: { description: "Shows an Import button that calls this" },
		onAddNew: {
			description:
				"A function: an enabled New button. A string: a disabled New button with this reason. An array: one button per entry.",
		},
		hideSettings: { description: 'Hides the "Columns" button' },
		hideReset: {
			description: 'Hides the "Reset" button and menu (Refresh included)',
		},
		keepExportMenuOpenAfterDownload: {
			description: "Keeps the Export menu open after a download",
		},
	},
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * ISSUE-3495-ITEM-18: on a phone, Enter on "Search" opens the search popover
 * with focus in its field, so what the user types right away is searched;
 * Escape closes it and focus returns to "Search"
 */
export const Issue3495Item18PhoneSearchFocusesField: Story = {
	args: { columns: COLUMNS, loadData: loadPeople },
	globals: PHONE,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const search = canvas.getByRole("button", { name: "Search" });
		search.focus();
		await userEvent.keyboard("{Enter}");
		const dialog = await body.findByRole("dialog", { name: "Search" });
		const field = within(dialog).getByRole("textbox");
		await waitFor(() => expect(field).toHaveFocus());
		await expect(search).toHaveAttribute("aria-expanded", "true");
		await userEvent.keyboard("bob");
		await expect(field).toHaveValue("bob");
		await waitFor(() =>
			expect(canvas.queryByText("Alice Müller")).not.toBeInTheDocument(),
		);
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(search).toHaveFocus());
		await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
		await expect(search).toHaveAttribute("aria-expanded", "false");
	},
};

/**
 * ISSUE-3495-ITEM-13: the column settings' "Visible" and "Pin" checkboxes have no
 * accessible name
 */
export const Issue3495Item13SettingsCheckboxesAreNamed: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		classes: { contentOverlayPaper: "story-settings" },
	},
	parameters: {
		a11y: {
			test: "error",
			context: { include: [".story-settings"] },
			options: { runOnly: { type: "rule", values: ["label"] } },
		},
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
		await expect(
			await canvas.findByRole("button", { name: "Close" }),
		).toBeVisible();
	},
};

/**
 * ISSUE-3495-ITEM-14: Enter on an export entry drops keyboard focus to the page: the
 * entry is replaced by another one for each status
 */
export const Issue3495Item14ExportEntryKeepsFocus: Story = {
	args: { columns: COLUMNS, loadData: loadPeople, exporters: [EXCEL] },
	play: async ({ canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		canvas.getByRole("button", { name: "Export" }).focus();
		await userEvent.keyboard("{Enter}");
		const excel = await body.findByRole("menuitem", { name: "Excel" });
		await waitFor(() => expect(excel).toHaveFocus());
		await userEvent.keyboard("{Enter}");
		await expect(
			document.activeElement?.getAttribute("role"),
			`focus is on ${document.activeElement?.tagName}`,
		).toBe("menuitem");
		await waitFor(() =>
			expect(body.getByRole("menuitem", { name: "Download" })).toHaveFocus(),
		);
	},
};

/** An exporter whose request fails after 100ms */
const FAILING: IDataGridExporter<unknown> = {
	...EXCEL,
	id: "failing",
	onRequest: () =>
		new Promise((_resolve, reject) =>
			setTimeout(() => reject(new Error("story: export failed")), 100),
		),
};

/**
 * ISSUE-3495-ITEM-14: by keyboard, a failed export keeps focus on its entry,
 * Enter on the failed entry turns it back to idle with focus on it, and Escape
 * still closes the menu
 */
export const Issue3495Item14FailedExportKeepsFocus: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		exporters: [FAILING],
		onError: fn(),
	},
	play: async ({ args, canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const button = canvas.getByRole("button", { name: "Export" });
		button.focus();
		await userEvent.keyboard("{Enter}");
		const entry = await body.findByRole("menuitem", { name: "Excel" });
		await waitFor(() => expect(entry).toHaveFocus());
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(args.onError).toHaveBeenCalledOnce());
		await expect(entry).toHaveAccessibleName("Export failed");
		await expect(entry).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(entry).toHaveAccessibleName("Excel");
		await expect(entry).toHaveFocus();
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(button).toHaveFocus());
	},
};

/**
 * ISSUE-3495-ITEM-14: an export by keyboard alone: Enter requests it, Enter on
 * the ready entry downloads it, and in a menu kept open after the download
 * focus stays on the entry
 */
export const Issue3495Item14DownloadByKeyboard: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		exporters: [{ ...EXCEL, onDownload: fn() }],
		keepExportMenuOpenAfterDownload: true,
	},
	play: async ({ args, canvas }) => {
		const body = within(document.body);
		const onDownload = args.exporters?.[0].onDownload;
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		canvas.getByRole("button", { name: "Export" }).focus();
		await userEvent.keyboard("{Enter}");
		const entry = await body.findByRole("menuitem", { name: "Excel" });
		await waitFor(() => expect(entry).toHaveFocus());
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(entry).toHaveAccessibleName("Download"));
		await expect(entry).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(onDownload).toHaveBeenCalledOnce();
		await expect(onDownload).toHaveBeenCalledWith("file.xlsx", undefined);
		await expect(entry).toHaveAccessibleName("Excel");
		await expect(entry).toHaveFocus();
	},
};

/**
 * ISSUE-3495-ITEM-16: Enter on Delete drops keyboard focus to the page once the deleted
 * rows are unselected, because Delete turns disabled
 */
export const Issue3495Item16DeleteByKeyboardKeepsFocus: Story = {
	args: { columns: COLUMNS, loadData: loadPeople, onDelete: fn() },
	play: async ({ args, canvas, canvasElement }) => {
		await userEvent.click(await canvas.findByText("Bob Smith"));
		const del = canvas.getByRole("button", { name: "Delete" });
		await waitFor(() => expect(del).toBeEnabled());
		del.focus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onDelete).toHaveBeenCalledOnce();
		// the selection is cleared once onDelete resolved
		await waitFor(() =>
			expect(
				canvasElement.querySelectorAll(
					".CcDataGrid-dataCell input[type=checkbox]:checked",
				),
			).toHaveLength(0),
		);
		await expect(document.activeElement, "focus fell to the page").not.toBe(
			document.body,
		);
	},
};

/**
 * ISSUE-3495-ITEM-16: an unavailable Delete stays in the tab order, marked
 * unavailable and dimmed, and neither Enter nor a click on it deletes. After a
 * delete by keyboard, focus stays on it.
 */
export const Issue3495Item16UnavailableDeleteKeepsFocus: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		onDelete: fn(),
		classes: { footer: "story-footer" },
	},
	// the footer only: the rest of the grid has violations of its own
	parameters: {
		a11y: {
			test: "error",
			context: { include: [".story-footer"] },
			options: {
				rules: {
					// the caption of the unavailable Delete: an inactive control,
					// which WCAG 1.4.3 exempts
					"color-contrast": { enabled: false },
				},
			},
		},
	},
	play: async ({ args, canvas }) => {
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		const del = canvas.getByRole("button", { name: "Delete" });
		await expect(del).toHaveAttribute("aria-disabled", "true");
		await expect(del).toHaveClass("Mui-disabled");
		await expect(del.closest("label")).toHaveClass("Mui-disabled");
		await expect(del.tabIndex).toBe(0);
		del.focus();
		await expect(del).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await userEvent.keyboard(" ");
		// the caption is the button's label: a click on it clicks the button
		await userEvent.click(canvas.getByText("Delete"));
		await expect(args.onDelete).not.toHaveBeenCalled();

		await userEvent.click(canvas.getByText("Bob Smith"));
		await waitFor(() => expect(del).not.toHaveAttribute("aria-disabled"));
		await expect(del.closest("label")).not.toHaveClass("Mui-disabled");
		del.focus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onDelete).toHaveBeenCalledOnce();
		await waitFor(() => expect(del).toHaveAttribute("aria-disabled", "true"));
		await expect(del).toHaveFocus();
	},
};

/**
 * ISSUE-3495-ITEM-17: below md the header's buttons are MUI IconButtons whose keyboard
 * focus shows only as a faint ripple (here: Reset on a tablet)
 */
export const Issue3495Item17HeaderIconButtonShowsFocus: Story = {
	args: { columns: COLUMNS, loadData: loadPeople },
	globals: { viewport: { value: "tablet", isRotated: false } },
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		canvas.getByRole("button", { name: "Columns" }).focus();
		await userEvent.tab();
		const reset = canvas.getByRole("button", { name: "Reset" });
		await expect(reset).toHaveFocus();
		await waitFor(() => expect(reset).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(reset);
		await expect(
			(style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2) ||
				style.boxShadow !== "none",
			"no outline or ring on the focused button",
		).toBe(true);
	},
};

/**
 * ISSUE-3495-ITEM-17: on a tablet, Columns, Reset, Export and Import show a focus
 * ring around the button when reached by keyboard
 */
export const Issue3495Item17TabletHeaderButtonsShowFocus: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		exporters: [EXCEL],
		onImport: fn(),
	},
	globals: { viewport: { value: "tablet", isRotated: false } },
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const columns = canvas.getByRole("button", { name: "Columns" });
		columns.focus();
		await waitFor(() => expect(columns).toHaveClass("Mui-focusVisible"));
		await expectFocusRing(columns, 2);
		for (const name of ["Reset", "Export", "Import"]) {
			await userEvent.tab();
			const button = canvas.getByRole("button", { name });
			await expect(button).toHaveFocus();
			await waitFor(() => expect(button).toHaveClass("Mui-focusVisible"));
			await expectFocusRing(button, 2);
		}
	},
};

/**
 * ISSUE-3495-ITEM-17: on a phone with a filter bar, Search and More options show a
 * focus ring around the button when reached by keyboard
 */
export const Issue3495Item17PhoneHeaderButtonsShowFocus: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		filterBar: SimpleFilterBar,
		exporters: [EXCEL],
	},
	globals: PHONE,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const search = canvas.getByRole("button", { name: "Search" });
		search.focus();
		await waitFor(() => expect(search).toHaveClass("Mui-focusVisible"));
		await expectFocusRing(search, 2);
		// below enableFilterDialogWidth (600px by default) the filter bar moves into
		// the panel, so its "Filter" button comes between Search and More options
		await userEvent.tab();
		await expect(
			canvasElement.ownerDocument.activeElement,
		).toHaveAccessibleName("Filter selection");
		await userEvent.tab();
		const more = canvas.getByRole("button", { name: "More options" });
		await expect(more).toHaveFocus();
		await waitFor(() => expect(more).toHaveClass("Mui-focusVisible"));
		await expectFocusRing(more, 2);
	},
};

/**
 * ISSUE-3495-ITEM-17: in the column settings, a checkbox shows a focus ring around
 * its box and "Close" a ring outside its filled background when reached by
 * keyboard
 */
export const Issue3495Item17SettingsShowFocus: Story = {
	args: { columns: COLUMNS, loadData: loadPeople },
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
		const close = await canvas.findByRole("button", { name: "Close" });
		const visible = canvas.getAllByRole("checkbox", { name: /^Visible / })[0];
		visible.focus();
		const root = visible.closest(".MuiCheckbox-root");
		if (!root) throw new Error("the checkbox has no MUI root");
		await waitFor(() => expect(root).toHaveClass("Mui-focusVisible"));
		const box = root.querySelector(":scope > svg");
		if (!box) throw new Error("the checkbox has no box icon");
		await expectFocusRing(box, 2);
		close.focus();
		await waitFor(() => expect(close).toHaveClass("Mui-focusVisible"));
		// outside the button, so the ring stands out against the panel, not the fill
		await expectFocusRing(close, 2);
	},
};

/**
 * ISSUE-3506-ITEM-11: `deleting`, set while a delete request runs: Delete shows its
 * progress in place of its icon, keeps focus but cannot be pressed again, and the
 * footer's actions are busy
 */
export const Issue3506Item11DeletingShowsProgress: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		onDelete: fn(),
		deleting: true,
		classes: { footer: "story-footer" },
	},
	// the footer only: the rest of the grid has violations of its own
	parameters: {
		a11y: {
			test: "error",
			context: { include: [".story-footer"] },
			options: {
				rules: {
					// the caption of the unavailable Delete: an inactive control,
					// which WCAG 1.4.3 exempts
					"color-contrast": { enabled: false },
				},
			},
		},
	},
	play: async ({ args, canvas }) => {
		await userEvent.click(await canvas.findByText("Bob Smith"));
		const del = canvas.getByRole("button", { name: "Delete" });
		await expect(del).toHaveAttribute("aria-disabled", "true");
		await expect(within(del).getByRole("progressbar")).toHaveAccessibleName(
			"Delete",
		);
		await expect(del.closest("[aria-busy=true]")).not.toBeNull();
		del.focus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onDelete).not.toHaveBeenCalled();
		await expect(del).toHaveFocus();
	},
};

/**
 * ISSUE-3495-ITEM-1: on a phone with a filter bar, More options → Export opens the
 * Export menu, below the More options button
 */
export const Issue3495Item1PhoneExportFromMoreOptions: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		filterBar: SimpleFilterBar,
		exporters: [EXCEL],
	},
	globals: PHONE,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const more = canvas.getByRole("button", { name: "More options" });
		await userEvent.click(more);
		await userEvent.click(
			await body.findByRole("menuitem", { name: "Export" }),
		);
		const excel = await body.findByRole("menuitem", { name: "Excel" });
		await waitFor(() => expect(excel).toBeVisible());
		const paper = excel.closest<HTMLElement>(".MuiPaper-root");
		if (!paper) throw new Error("the Excel entry is not in a menu paper");
		await waitFor(async () => {
			const menuRect = paper.getBoundingClientRect();
			const buttonRect = more.getBoundingClientRect();
			// anchored to the button, not to the closed menu's Export entry
			await expect(
				Math.abs(menuRect.top - buttonRect.bottom),
			).toBeLessThanOrEqual(2);
			await expect(menuRect.left).toBeLessThan(buttonRect.right);
			await expect(menuRect.right).toBeGreaterThan(buttonRect.left);
		});
	},
};

/**
 * ISSUE-3495-ITEM-20: on a phone with a filter bar, More options → Reset opens the Reset
 * menu away from the button, and Escape drops focus to the page
 */
export const Issue3495Item20PhoneResetMenuReturnsFocus: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		filterBar: SimpleFilterBar,
	},
	globals: PHONE,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const more = canvas.getByRole("button", { name: "More options" });
		more.focus();
		await userEvent.keyboard("{Enter}");
		const resetItem = await body.findByRole("menuitem", { name: "Reset" });
		await waitFor(() =>
			expect(body.getByRole("menuitem", { name: "Columns" })).toHaveFocus(),
		);
		await userEvent.keyboard("{ArrowDown}");
		await expect(resetItem).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		const refresh = await body.findByRole("menuitem", { name: "Refresh" });
		await waitFor(() => expect(refresh).toHaveFocus());
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(
				body.queryByRole("menuitem", { name: "Refresh" }),
			).not.toBeInTheDocument(),
		);
		await waitFor(() =>
			expect(
				more,
				`focus is on ${document.activeElement?.tagName}`,
			).toHaveFocus(),
		);
	},
};

/**
 * ISSUE-3495-ITEM-20: on a phone with a filter bar, More options → Reset opens the Reset
 * menu below the More options button
 */
export const Issue3495Item20PhoneResetMenuBelowMoreOptions: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		filterBar: SimpleFilterBar,
	},
	globals: PHONE,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const more = canvas.getByRole("button", { name: "More options" });
		await userEvent.click(more);
		await userEvent.click(await body.findByRole("menuitem", { name: "Reset" }));
		const refresh = await body.findByRole("menuitem", { name: "Refresh" });
		await waitFor(() => expect(refresh).toBeVisible());
		const menu = body.getByRole("menu", { name: "Reset" });
		await expect(menu).toContainElement(refresh);
		const paper = refresh.closest<HTMLElement>(".MuiPaper-root");
		if (!paper) throw new Error("the Refresh entry is not in a menu paper");
		await waitFor(async () => {
			const menuRect = paper.getBoundingClientRect();
			const buttonRect = more.getBoundingClientRect();
			// anchored to the button, not to the closed menu's Reset entry
			await expect(
				Math.abs(menuRect.top - buttonRect.bottom),
			).toBeLessThanOrEqual(2);
			await expect(menuRect.left).toBeLessThan(buttonRect.right);
			await expect(menuRect.right).toBeGreaterThan(buttonRect.left);
		});
	},
};

/**
 * ISSUE-3495-ITEM-20: on a phone with a filter bar, the Export menu opened from More
 * options returns focus to the More options button when it closes
 */
export const Issue3495Item20PhoneExportMenuReturnsFocus: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		filterBar: SimpleFilterBar,
		exporters: [EXCEL],
	},
	globals: PHONE,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const more = canvas.getByRole("button", { name: "More options" });
		more.focus();
		await userEvent.keyboard("{Enter}");
		const exportItem = await body.findByRole("menuitem", { name: "Export" });
		await waitFor(() =>
			expect(body.getByRole("menuitem", { name: "Columns" })).toHaveFocus(),
		);
		await userEvent.keyboard("{ArrowDown}{ArrowDown}");
		await expect(exportItem).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		const excel = await body.findByRole("menuitem", { name: "Excel" });
		await waitFor(() => expect(excel).toHaveFocus());
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(
				body.queryByRole("menuitem", { name: "Excel" }),
			).not.toBeInTheDocument(),
		);
		await waitFor(() =>
			expect(
				more,
				`focus is on ${document.activeElement?.tagName}`,
			).toHaveFocus(),
		);
	},
};
