import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Box, Grid } from "@mui/material";
import {
	Mail as MailIcon,
	MenuBook as LogIcon,
	PersonAdd as InviteIcon,
	PlaylistAdd as PlaylistAddIcon,
	School as SchoolIcon,
} from "@mui/icons-material";
import { DataGrid, DataGridNoPersist } from "./index";
import ccI18n from "../../i18n";
import type {
	DataGridCustomDataActionButton,
	DataGridData,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "./DataGrid";
import type { IDataGridExporter } from "./Header";

// ─── Sample data ────────────────────────────────────────────────────────────
import {
	edgesPast,
	pageScrollsSideways,
} from "../../stories/test-utils/hiddenTextLayout";

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

const LOG_BUTTON: DataGridCustomDataActionButton = {
	icon: <LogIcon />,
	label: "Medical device log",
	isDisabled: (numSelected) => numSelected !== 1,
	onClick: () => {},
};

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

/**
 * ISSUE-3495-ITEM-22: on a 320px phone, a header with two add buttons and a footer with
 * Edit, Delete and one custom action are wider than the screen
 */
export const Issue3495Item22PhoneHeaderAndFooterFit: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		exporters: [EXCEL],
		onImport: fn(),
		onAddNew: [
			{ label: "New", onClick: fn() },
			{ icon: <InviteIcon />, label: "Invite", onClick: fn() },
		],
		onEdit: fn(),
		onDelete: fn(),
		enableSelectAll: true,
		customDataActionButtons: [LOG_BUTTON],
		classes: { header: "story-header", footer: "story-footer" },
	},
	globals: PHONE,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const header = canvasElement.querySelector<HTMLElement>(".story-header")!;
		const footer = canvasElement.querySelector<HTMLElement>(".story-footer")!;
		await expect(header.scrollWidth, "header").toBeLessThanOrEqual(
			header.clientWidth,
		);
		await expect(footer.scrollWidth, "footer").toBeLessThanOrEqual(
			footer.clientWidth,
		);
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			window.innerWidth,
		);
	},
};

// ─── Footer layout ────────────────────────────────────────────────────────────

/** FOLLOWUP-DATAGRID-FOOTER-LAYOUT: three people, so the count is short ("#3" on a phone) */
const loadThree = (): DataGridData => ({
	rowsTotal: 3,
	rowsFiltered: 3,
	rows: PEOPLE.slice(0, 3),
});

const FOOTER_LAYOUT_CLASSES = {
	footer: "story-footer",
	paginationText: "story-count",
};

/** FOLLOWUP-DATAGRID-FOOTER-LAYOUT: axe on the footer only, as in the footer stories above */
const FOOTER_LAYOUT_PARAMETERS = {
	a11y: {
		test: "error",
		context: { include: [".story-footer"] },
		options: {
			rules: {
				// the captions of the unavailable Edit and Delete: inactive controls,
				// which WCAG 1.4.3 exempts
				"color-contrast": { enabled: false },
			},
		},
	},
};

/**
 * FOLLOWUP-DATAGRID-FOOTER-LAYOUT: what the user sees of an element: the boxes of its button
 * or checkbox and of its text, one per line
 */
const visibleBoxes = (element: Element): DOMRect[] => {
	const boxes: DOMRect[] = [];
	const control = element.querySelector("button, .MuiCheckbox-root");
	if (control) boxes.push(control.getBoundingClientRect());
	const range = document.createRange();
	const texts = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	for (let text = texts.nextNode(); text; text = texts.nextNode()) {
		range.selectNodeContents(text);
		boxes.push(...Array.from(range.getClientRects()));
	}
	return boxes;
};

/** FOLLOWUP-DATAGRID-FOOTER-LAYOUT: the number of lines an element's text takes */
const lineCount = (element: Element) =>
	new Set(visibleBoxes(element).map((box) => Math.round(box.top))).size;

/**
 * FOLLOWUP-DATAGRID-FOOTER-LAYOUT: the space between two boxes side by side, negative where
 * they overlap
 */
const horizontalGap = (a: DOMRect, b: DOMRect) =>
	Math.max(b.left - a.right, a.left - b.right);

/**
 * FOLLOWUP-DATAGRID-FOOTER-LAYOUT: checks the footer bar (inside the footer's border and
 * padding). Its actions and the count are centred in it (within 1px) and at least 4px clear of
 * its top and bottom; its dividers run from its top to its bottom; the button or checkbox and
 * the caption of every action keep at least minGap px to the dividers and to the count; nothing
 * comes closer than 8px to the bar's ends or makes the page scroll sideways.
 * @param canvasElement The story's canvas
 * @param minGap The space the actions keep to the dividers beside them
 * @param dividers The number of dividers the footer shows
 */
const expectFooterLayout = async (
	canvasElement: HTMLElement,
	minGap: number,
	dividers: number,
) => {
	const footer = canvasElement.querySelector(".story-footer")!;
	const style = getComputedStyle(footer);
	const rect = footer.getBoundingClientRect();
	const bar = {
		top:
			rect.top +
			parseFloat(style.borderTopWidth) +
			parseFloat(style.paddingTop),
		bottom:
			rect.bottom -
			parseFloat(style.borderBottomWidth) -
			parseFloat(style.paddingBottom),
		left:
			rect.left +
			parseFloat(style.borderLeftWidth) +
			parseFloat(style.paddingLeft),
		right:
			rect.right -
			parseFloat(style.borderRightWidth) -
			parseFloat(style.paddingRight),
	};
	const barCentre = (bar.top + bar.bottom) / 2;
	const actions = Array.from(footer.querySelectorAll("label"));
	const count = footer.querySelector(".story-count")!;
	const lines = Array.from(footer.querySelectorAll("div")).filter(
		(element) =>
			element.childElementCount === 0 &&
			getComputedStyle(element).borderRightStyle === "solid",
	);
	await expect(lines).toHaveLength(dividers);

	for (const item of [...actions, count]) {
		const name = item.textContent;
		const box = item.getBoundingClientRect();
		await expect(
			Math.abs((box.top + box.bottom) / 2 - barCentre),
			`${name} is not centred`,
		).toBeLessThanOrEqual(1);
		for (const visible of visibleBoxes(item)) {
			await expect(
				visible.top - bar.top,
				`${name} to the top`,
			).toBeGreaterThanOrEqual(3.5);
			await expect(
				bar.bottom - visible.bottom,
				`${name} to the bottom`,
			).toBeGreaterThanOrEqual(3.5);
			await expect(
				visible.left - bar.left,
				`${name} to the start`,
			).toBeGreaterThanOrEqual(8);
			await expect(
				bar.right - visible.right,
				`${name} to the end`,
			).toBeGreaterThanOrEqual(8);
		}
	}
	for (const line of lines) {
		const box = line.getBoundingClientRect();
		await expect(
			Math.abs(box.top - bar.top),
			"divider top",
		).toBeLessThanOrEqual(0.5);
		await expect(
			Math.abs(box.bottom - bar.bottom),
			"divider bottom",
		).toBeLessThanOrEqual(0.5);
	}
	const countBoxes = visibleBoxes(count);
	for (const action of actions) {
		for (const visible of visibleBoxes(action)) {
			for (const other of [
				...lines.map((line) => line.getBoundingClientRect()),
				...countBoxes,
			]) {
				await expect(
					horizontalGap(visible, other),
					`${action.textContent} to its neighbour`,
				).toBeGreaterThanOrEqual(minGap);
			}
		}
	}
	await expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
	await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
		window.innerWidth,
	);
};

/**
 * FOLLOWUP-DATAGRID-FOOTER-LAYOUT: the footer's actions, with one- and two-line captions, and
 * the count sit in the middle of the footer, and every action keeps 20px to the dividers beside
 * it
 */
export const FollowupDatagridFooterLayoutDesktop: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadThree,
		enableSelectAll: true,
		onEdit: fn(),
		onDelete: fn(),
		customDataActionButtons: [
			{
				label: "Invite",
				icon: <MailIcon />,
				isDisabled: () => false,
				onClick: fn(),
			},
			{
				label: "Create\nmaintenance order",
				icon: <PlaylistAddIcon />,
				isDisabled: () => false,
				onClick: fn(),
			},
		],
		classes: FOOTER_LAYOUT_CLASSES,
	},
	parameters: FOOTER_LAYOUT_PARAMETERS,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(canvas.getByText("Total: 3")).toBeVisible();
		await expect(lineCount(canvas.getByText("Create maintenance order"))).toBe(
			2,
		);
		await expectFooterLayout(canvasElement, 19.5, 4);
	},
};

/**
 * FOLLOWUP-DATAGRID-FOOTER-LAYOUT: on a 320px phone, Edit, Delete, a custom action whose
 * caption takes two lines there and the count fit into the footer, in its middle, and every
 * action keeps 12px to the dividers beside it
 */
export const FollowupDatagridFooterLayoutPhone: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadThree,
		onEdit: fn(),
		onDelete: fn(),
		customDataActionButtons: [
			{
				label: "Document the safety briefing",
				icon: <SchoolIcon />,
				isDisabled: () => false,
				onClick: fn(),
			},
		],
		classes: FOOTER_LAYOUT_CLASSES,
	},
	globals: PHONE,
	parameters: FOOTER_LAYOUT_PARAMETERS,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(canvas.getByText("#3")).toBeVisible();
		await expect(
			lineCount(canvas.getByText("Document the safety briefing")),
		).toBe(2);
		// the hidden select all takes no place on phones (ISSUE-3495-ITEM-22)
		await expectFooterLayout(canvasElement, 11.5, 2);
	},
};

/**
 * FOLLOWUP-DATAGRID-FOOTER-LAYOUT: on a 320px phone with select all and the custom actions in
 * the More menu, the one-line captions sit in the middle of the footer and keep 12px to the
 * dividers
 */
export const FollowupDatagridFooterLayoutPhoneMore: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadThree,
		enableSelectAll: true,
		onEdit: fn(),
		onDelete: fn(),
		customDataActionButtons: [
			{
				label: "Invite",
				icon: <MailIcon />,
				isDisabled: () => false,
				onClick: fn(),
			},
			{
				label: "Add to list",
				icon: <PlaylistAddIcon />,
				isDisabled: () => false,
				onClick: fn(),
			},
		],
		classes: FOOTER_LAYOUT_CLASSES,
	},
	globals: PHONE,
	parameters: FOOTER_LAYOUT_PARAMETERS,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(canvas.getByRole("button", { name: "More" })).toBeVisible();
		await expectFooterLayout(canvasElement, 11.5, 3);
	},
};

// ─── Phones ───────────────────────────────────────────────────────────────────

/**
 * ISSUE-3495-ITEM-22: checks that the header's buttons lie inside the header and that no two of
 * them overlap, and that neither the header nor the page scrolls sideways
 * @param canvasElement The story's canvas
 */
const expectHeaderButtonsFit = async (canvasElement: HTMLElement) => {
	const header = canvasElement.querySelector<HTMLElement>(".story-header")!;
	const box = header.getBoundingClientRect();
	const buttons = Array.from(header.querySelectorAll("button")).map(
		(button, index) => ({
			name: button.getAttribute("aria-label") ?? `button ${index + 1}`,
			rect: button.getBoundingClientRect(),
		}),
	);
	for (const { name, rect } of buttons) {
		await expect(
			rect.left - box.left,
			`${name} to the start`,
		).toBeGreaterThanOrEqual(0);
		await expect(
			box.right - rect.right,
			`${name} to the end`,
		).toBeGreaterThanOrEqual(0);
	}
	for (let i = 1; i < buttons.length; i++) {
		await expect(
			horizontalGap(buttons[i - 1].rect, buttons[i].rect),
			`${buttons[i - 1].name} and ${buttons[i].name} overlap`,
		).toBeGreaterThanOrEqual(0);
	}
	await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
	await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
		window.innerWidth,
	);
};

/**
 * ISSUE-3495-ITEM-22: on a 320px phone with two add buttons, the header shows Search, More
 * options and the first add button side by side; More options holds Columns, Reset, Export,
 * Import and the second add button
 */
export const Issue3495Item22PhoneHeaderMovesAddButtonsIntoMoreOptions: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		exporters: [EXCEL],
		onImport: fn(),
		onAddNew: [
			{ label: "New", onClick: fn() },
			{ icon: <InviteIcon />, label: "Invite", onClick: fn() },
		],
		classes: { header: "story-header" },
	},
	globals: PHONE,
	parameters: {
		a11y: {
			test: "error",
			// the grid behind the menu has its own violations (ISSUE-3492-ITEM-25, ISSUE-3493-ITEM-13)
			context: { include: ["[role=menu]"] },
		},
	},
	play: async ({ args, canvas, canvasElement }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expectHeaderButtonsFit(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "More options" }));
		const menu = await body.findByRole("menu");
		await expect(
			within(menu)
				.getAllByRole("menuitem")
				.map((item) => item.textContent),
		).toEqual(["Columns", "Reset", "Export", "Import", "Invite"]);
		await userEvent.click(
			within(menu).getByRole("menuitem", { name: "Invite" }),
		);
		const addButtons = args.onAddNew as { onClick: () => void }[];
		await expect(addButtons[1].onClick).toHaveBeenCalledOnce();
		await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
		// open again for the axe check
		await userEvent.click(canvas.getByRole("button", { name: "More options" }));
		const reopened = await body.findByRole("menu");
		await waitFor(() => expect(reopened).toBeVisible());
	},
};

/**
 * ISSUE-3495-ITEM-22: on a 320px phone with Columns, Reset, Export, Import and one add button,
 * More options holds the four, so no button overlaps another
 */
export const Issue3495Item22PhoneHeaderOneAddButtonFits: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		exporters: [EXCEL],
		onImport: fn(),
		onAddNew: fn(),
		classes: { header: "story-header" },
	},
	globals: PHONE,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(
			canvas.getByRole("button", { name: "More options" }),
		).toBeVisible();
		await expectHeaderButtonsFit(canvasElement);
	},
};

/**
 * ISSUE-3495-ITEM-22: on a 320px phone with select all, Edit, Delete, one custom action and a
 * filtered count, the custom action is an entry of More, and the footer keeps its layout
 */
export const Issue3495Item22PhoneFooterFourActionsFit: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		enableSelectAll: true,
		onEdit: fn(),
		onDelete: fn(),
		customDataActionButtons: [LOG_BUTTON],
		classes: FOOTER_LAYOUT_CLASSES,
	},
	globals: PHONE,
	parameters: FOOTER_LAYOUT_PARAMETERS,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(canvas.getByRole("button", { name: "More" })).toBeVisible();
		await expectFooterLayout(canvasElement, 11.5, 3);
	},
};

/**
 * ISSUE-3495-ITEM-22: on a 320px phone without select all, Edit, Delete, a custom action with
 * a long word and a filtered count fit: the hidden select all takes no place, and the count
 * takes two lines, breaking after the slash
 */
export const Issue3495Item22PhoneFooterWithoutSelectAllFits: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		onEdit: fn(),
		onDelete: fn(),
		customDataActionButtons: [
			{
				label: "Einweisung dokumentieren",
				icon: <SchoolIcon />,
				isDisabled: () => false,
				onClick: fn(),
			},
		],
		classes: FOOTER_LAYOUT_CLASSES,
	},
	globals: PHONE,
	parameters: FOOTER_LAYOUT_PARAMETERS,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const footer = within(
			canvasElement.querySelector<HTMLElement>(".story-footer")!,
		);
		await expect(footer.queryByRole("checkbox")).toBeNull();
		await expect(
			footer.getByRole("button", { name: "Einweisung dokumentieren" }),
		).toBeVisible();
		const count = canvasElement.querySelector(".story-count")!;
		await expect(count.textContent).toMatch(/^#567\/1\D?234$/);
		await expect(lineCount(count)).toBe(2);
		await expectFooterLayout(canvasElement, 11.5, 2);
	},
};

/**
 * ISSUE-3495-ITEM-22: in German, the longest captions of the footer's actions (Bearbeiten,
 * Löschen) and a filtered count fit a 320px phone beside select all and More
 */
export const Issue3495Item22PhoneFooterInGermanFits: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		enableSelectAll: true,
		onEdit: fn(),
		onDelete: fn(),
		customDataActionButtons: [LOG_BUTTON],
		classes: FOOTER_LAYOUT_CLASSES,
	},
	globals: PHONE,
	parameters: FOOTER_LAYOUT_PARAMETERS,
	beforeEach: async () => {
		await ccI18n.changeLanguage("de");
		return async () => {
			await ccI18n.changeLanguage("en");
		};
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(canvas.getByRole("button", { name: "Mehr" })).toBeVisible();
		await expect(
			canvas.getByRole("button", { name: "Bearbeiten" }),
		).toBeVisible();
		await expectFooterLayout(canvasElement, 11.5, 3);
	},
};

export const Issue3473Item16HiddenSettingsStatusStaysInside: Story = {
	args: { columns: COLUMNS, loadData: loadPeople },
	globals: PHONE,
	decorators: [
		(Story) => (
			<Box dir={"rtl"} sx={{ height: "100%" }}>
				<Story />
			</Box>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-16: at 320px in a right-to-left part of a left-to-right page, the visually hidden status region of the column settings lies inside the box it is placed in (the nearest positioned ancestor), so it never makes the page scroll sideways. With MUI's visually hidden style, its -1px margin put it 1px past the top and start edges of its container wherever it began the container.",
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
		await expect(
			await canvas.findByRole("button", { name: "Close" }),
		).toBeVisible();
		const status = canvasElement.querySelector<HTMLElement>(
			'[class*="CcDataGrid-settingsStatus"]',
		);
		if (!status) throw new Error("the settings have no status region");
		// the panel opens with a transition
		await waitFor(() => expect(edgesPast(status)).toEqual([]));
		await expect(pageScrollsSideways()).toBe(false);
	},
};
