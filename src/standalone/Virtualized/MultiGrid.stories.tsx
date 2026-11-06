/* eslint-disable react/no-children-prop */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Box, Dialog, DialogContent } from "@mui/material";
import MultiGrid, { MultiGridProps } from "./MultiGrid";
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

// the pane styles are module constants: a new object on every render would
// defeat MultiGrid's memoization
const NO_STYLE: React.CSSProperties = {};
// with data rows the body pane drives the header's horizontal position, so the
// header itself does not scroll (as in DataGrid)
const HEADER_WITH_ROWS: React.CSSProperties = { overflow: "hidden" };

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

/**
 * Spreads `ariaAttributes`, so every cell is a `gridcell` inside its row, and
 * applies `style`, which positions the cell.
 */
const CellRenderer = ({
	columnIndex,
	rowIndex,
	style,
	ariaAttributes,
}: CellComponentProps) => {
	const isHeader = rowIndex === 0 || columnIndex === 0;
	return (
		<div
			{...ariaAttributes}
			style={{ ...style, ...(isHeader ? HEADER_STYLE : CELL_STYLE) }}
		>
			{rowLabel(rowIndex, columnIndex)}
		</div>
	);
};

/** MultiGrid's root is absolutely positioned: give it a positioned, sized parent */
const GridBox = (props: MultiGridProps) => (
	<Box
		data-testid={"grid-box"}
		sx={{ position: "relative", width: props.width, height: props.height }}
	>
		<MultiGrid {...props} />
	</Box>
);

/**
 * The four panes in DOM order: top left, top right (pinned rows), bottom left
 * (pinned columns), bottom right (the scrolling pane, or the no-content
 * placeholder while there are no data rows).
 */
const getPanes = (container: HTMLElement) => {
	const root = within(container).getByTestId("grid-box")
		.firstElementChild as HTMLElement;
	const [topLeft, topRight, bottomLeft, bottomRight] = Array.from(
		root.children,
	) as HTMLElement[];
	return { root, topLeft, topRight, bottomLeft, bottomRight };
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

// Story tests run in headless Chromium, which hides scrollbars. A 15px border
// on the right and bottom of the scrolling pane takes the room that classic
// scrollbars (Windows, Linux desktops, macOS set to always show them) take
// from its viewport, and nothing from the header's or the pinned column's.
const BODY_WITH_SCROLLBAR_ROOM: React.CSSProperties = {
	boxSizing: "border-box",
	borderRight: "15px solid #bdbdbd",
	borderBottom: "15px solid #bdbdbd",
};

const SCROLLBAR_ROOM_PROPS: MultiGridProps = {
	width: 600,
	height: 400,
	columnCount: COLUMN_COUNT,
	columnWidth,
	rowCount: ROW_COUNT,
	rowHeight,
	fixedColumnCount: FIXED_COLUMNS,
	fixedRowCount: FIXED_ROWS,
	styleTopLeftGrid: NO_STYLE,
	styleTopRightGrid: HEADER_WITH_ROWS,
	styleBottomLeftGrid: NO_STYLE,
	styleBottomRightGrid: BODY_WITH_SCROLLBAR_ROOM,
	children: CellRenderer,
	noContentRenderer: NoContent,
	label: GRID_LABEL,
};

const SCROLLBAR_ROOM_A11Y = {
	test: "error",
	config: {
		// the pinned column pane scrolls (overflow: scroll) but is not focusable
		// and holds nothing focusable (ISSUE-3472-ITEM-17)
		rules: [{ id: "scrollable-region-focusable", enabled: false }],
	},
};

/**
 * Where scrollbars take room, the header and the pinned column leave out the
 * scrolling pane's scrollbars: scrolled to the end, the last column's header
 * still sits over that column and the last row's pinned cell next to that row.
 */
export const Issue3472Item2HeaderAndPinnedColumnFollowToTheEnd: StoryObj<
	typeof MultiGrid
> = {
	render: () => <GridBox {...SCROLLBAR_ROOM_PROPS} />,
	parameters: { a11y: SCROLLBAR_ROOM_A11Y },
	play: async ({ canvasElement }) => {
		const { topRight, bottomLeft, bottomRight } = getPanes(canvasElement);
		// the scrollbar room: less than 600 - 60 pinned and 400 - 35 header
		await expect(bottomRight.clientWidth).toBeLessThan(540);
		await expect(bottomRight.clientHeight).toBeLessThan(365);
		await expect(topRight.clientWidth).toBe(bottomRight.clientWidth);
		await expect(bottomLeft.clientHeight).toBe(bottomRight.clientHeight);

		bottomRight.scrollTo({ left: 100000, top: 100000 });
		const endLeft = bottomRight.scrollWidth - bottomRight.clientWidth;
		const endTop = bottomRight.scrollHeight - bottomRight.clientHeight;
		await waitFor(() => expect(bottomRight.scrollLeft).toBe(endLeft));
		await waitFor(() => expect(topRight.scrollLeft).toBe(endLeft));
		await waitFor(() => expect(bottomRight.scrollTop).toBe(endTop));
		await waitFor(() => expect(bottomLeft.scrollTop).toBe(endTop));

		const lastHeader = await within(topRight).findByText("Col 19");
		const lastRowPinned = await within(bottomLeft).findByText("Row 99");
		const lastCell = await within(bottomRight).findByText("R99C19");
		await expect(lastHeader.getBoundingClientRect().right).toBe(
			lastCell.getBoundingClientRect().right,
		);
		await expect(lastRowPinned.getBoundingClientRect().bottom).toBe(
			lastCell.getBoundingClientRect().bottom,
		);
	},
};

/**
 * With `globalScrollListener`, PageDown scrolls by the height the scrolling
 * pane shows, so no row is skipped where a scrollbar takes room.
 */
export const Issue3472Item2PageDownScrollsOneVisiblePage: StoryObj<
	typeof MultiGrid
> = {
	render: () => <GridBox {...SCROLLBAR_ROOM_PROPS} globalScrollListener />,
	parameters: { a11y: SCROLLBAR_ROOM_A11Y },
	play: async ({ canvasElement }) => {
		const { bottomLeft, bottomRight } = getPanes(canvasElement);
		const page = bottomRight.clientHeight;
		// the scrollbar room: less than 400 - 35 header
		await expect(page).toBeLessThan(365);

		await userEvent.keyboard("{PageDown}");
		await waitFor(() => expect(bottomRight.scrollTop).toBe(page));
		await waitFor(() => expect(bottomLeft.scrollTop).toBe(page));

		await userEvent.keyboard("{PageDown}");
		await waitFor(() => expect(bottomRight.scrollTop).toBe(2 * page));

		await userEvent.keyboard("{PageUp}");
		await waitFor(() => expect(bottomRight.scrollTop).toBe(page));
	},
};
