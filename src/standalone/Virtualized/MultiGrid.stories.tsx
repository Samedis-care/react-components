/* eslint-disable react/no-children-prop */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Box, Dialog, DialogContent } from "@mui/material";
import MultiGrid from "./MultiGrid";
import type { CellComponentProps } from "react-window";

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof MultiGrid> = {
	title: "standalone/Virtualized/MultiGrid",
	component: MultiGrid,
	parameters: { layout: "centered" },
};

export default meta;

// ─── Sample data ──────────────────────────────────────────────────────────────

const GRID_LABEL = "Demo grid contents";

const COLUMN_COUNT = 20;
const ROW_COUNT = 100;
const FIXED_COLUMNS = 1;
const FIXED_ROWS = 1;

const colLabel = (col: number) => (col === 0 ? "#" : `Col ${col}`);
const rowLabel = (row: number, col: number) =>
	row === 0 ? colLabel(col) : col === 0 ? `Row ${row}` : `R${row}C${col}`;

const columnWidth = (col: number) => (col === 0 ? 60 : 100);
const rowHeight = () => 35;

const CELL_STYLE: React.CSSProperties = {
	boxSizing: "border-box",
	border: "1px solid #e0e0e0",
	padding: "0 8px",
	display: "flex",
	alignItems: "center",
	overflow: "hidden",
	whiteSpace: "nowrap",
	fontSize: 13,
	background: "white",
};

const HEADER_STYLE: React.CSSProperties = {
	...CELL_STYLE,
	background: "#f5f5f5",
	fontWeight: "bold",
};

const NoContent = () => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			height: "100%",
			color: "text.secondary",
		}}
	>
		No content
	</Box>
);

// ─── Stories ──────────────────────────────────────────────────────────────────

const CellRenderer = ({ columnIndex, rowIndex, style }: CellComponentProps) => {
	const isHeader = rowIndex === 0 || columnIndex === 0;
	return (
		<div style={{ ...style, ...(isHeader ? HEADER_STYLE : CELL_STYLE) }}>
			{rowLabel(rowIndex, columnIndex)}
		</div>
	);
};

export const Default: StoryObj<typeof MultiGrid> = {
	render: () => (
		<Box sx={{ position: "relative", width: 600, height: 400 }}>
			<MultiGrid
				width={600}
				height={400}
				columnCount={COLUMN_COUNT}
				columnWidth={columnWidth}
				rowCount={ROW_COUNT}
				rowHeight={rowHeight}
				fixedColumnCount={FIXED_COLUMNS}
				fixedRowCount={FIXED_ROWS}
				styleTopLeftGrid={{}}
				styleTopRightGrid={{}}
				styleBottomLeftGrid={{}}
				styleBottomRightGrid={{}}
				children={CellRenderer}
				noContentRenderer={NoContent}
				label={GRID_LABEL}
			/>
		</Box>
	),
};

/**
 * Headers without rows: the bottom right pane isn't rendered at all, so the header
 * row is what scrolls horizontally and it takes over as the tab stop.
 */
export const NoData: StoryObj<typeof MultiGrid> = {
	render: () => (
		<Box sx={{ position: "relative", width: 600, height: 200 }}>
			<MultiGrid
				width={600}
				height={200}
				columnCount={COLUMN_COUNT}
				columnWidth={columnWidth}
				rowCount={FIXED_ROWS}
				rowHeight={rowHeight}
				fixedColumnCount={FIXED_COLUMNS}
				fixedRowCount={FIXED_ROWS}
				styleTopLeftGrid={{}}
				styleTopRightGrid={{ overflowX: "auto" }}
				styleBottomLeftGrid={{}}
				styleBottomRightGrid={{}}
				children={CellRenderer}
				noContentRenderer={NoContent}
				label={GRID_LABEL}
			/>
		</Box>
	),
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("No content")).toBeVisible();

		const pane = canvas.getByRole("grid", { name: GRID_LABEL });
		await expect(pane).toHaveAttribute("tabindex", "0");
		await expect(within(pane).getByText("Col 1")).toBeVisible();
		await expect(
			canvas.getAllByRole("grid").filter((grid) => grid.tabIndex === 0),
		).toHaveLength(1);
	},
};

/**
 * Page up/down scrolls this grid from anywhere on the page, without focusing it
 * first — for routes where the grid is the whole page and there is nothing else
 * those keys could sensibly page.
 */
export const WithGlobalScrollListener: StoryObj<typeof MultiGrid> = {
	render: () => (
		<Box sx={{ position: "relative", width: 600, height: 400 }}>
			<MultiGrid
				width={600}
				height={400}
				columnCount={COLUMN_COUNT}
				columnWidth={columnWidth}
				rowCount={ROW_COUNT}
				rowHeight={rowHeight}
				fixedColumnCount={FIXED_COLUMNS}
				fixedRowCount={FIXED_ROWS}
				styleTopLeftGrid={{}}
				styleTopRightGrid={{}}
				styleBottomLeftGrid={{}}
				styleBottomRightGrid={{}}
				children={CellRenderer}
				noContentRenderer={NoContent}
				label={GRID_LABEL}
				globalScrollListener
			/>
		</Box>
	),
};

/**
 * Inside a dialog the scrolling pane is the only thing keeping the grid reachable
 * without a pointer: the dialog paper holds focus from the moment it opens, and a
 * click on a cell used to resolve to the paper as the nearest focusable ancestor,
 * so arrow keys scrolled the paper's (unscrollable) ancestors instead of the grid.
 */
export const InDialog: StoryObj<typeof MultiGrid> = {
	render: () => (
		<Dialog open fullWidth maxWidth={"sm"}>
			<DialogContent>
				<Box sx={{ position: "relative", width: 400, height: 300 }}>
					<MultiGrid
						width={400}
						height={300}
						columnCount={COLUMN_COUNT}
						columnWidth={columnWidth}
						rowCount={ROW_COUNT}
						rowHeight={rowHeight}
						fixedColumnCount={FIXED_COLUMNS}
						fixedRowCount={FIXED_ROWS}
						styleTopLeftGrid={{}}
						styleTopRightGrid={{}}
						styleBottomLeftGrid={{}}
						styleBottomRightGrid={{}}
						children={CellRenderer}
						noContentRenderer={NoContent}
						label={GRID_LABEL}
					/>
				</Box>
			</DialogContent>
		</Dialog>
	),
	play: async () => {
		// the dialog renders into a portal, so it is outside the story canvas
		const body = within(document.body);
		const pane = await body.findByRole("grid", { name: GRID_LABEL });

		// the tab stop is what makes the browser aim arrow keys at this pane -
		// the scrolling itself is native, so there is nothing here to assert on
		await expect(pane).toHaveAttribute("tabindex", "0");

		// exactly one pane is a tab stop, the three pinned ones must not be
		await expect(
			body.getAllByRole("grid").filter((grid) => grid.tabIndex === 0),
		).toHaveLength(1);

		// clicking a cell has to land focus on the pane rather than on the paper
		await userEvent.click(within(pane).getByText("R1C1"));
		await waitFor(() => expect(pane).toHaveFocus());
	},
};
