/* eslint-disable react/no-children-prop */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
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
			/>
		</Box>
	),
};

export const NoData: StoryObj<typeof MultiGrid> = {
	render: () => (
		<Box sx={{ position: "relative", width: 600, height: 200 }}>
			<MultiGrid
				width={600}
				height={200}
				columnCount={FIXED_COLUMNS}
				columnWidth={columnWidth}
				rowCount={FIXED_ROWS}
				rowHeight={rowHeight}
				fixedColumnCount={FIXED_COLUMNS}
				fixedRowCount={FIXED_ROWS}
				styleTopLeftGrid={{}}
				styleTopRightGrid={{}}
				styleBottomLeftGrid={{}}
				styleBottomRightGrid={{}}
				children={CellRenderer}
				noContentRenderer={NoContent}
			/>
		</Box>
	),
};

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
				globalScrollListener
			/>
		</Box>
	),
};
