import React, { useContext } from "react";
import {
	MatrixCellContext,
	MatrixColumn,
	MatrixExtraRow,
	MatrixRangeSelection,
	MatrixRow,
	MatrixRowHeaderContext,
} from "./types";

export type MatrixGridClassKey =
	| "root"
	| "grid"
	| "corner"
	| "columnHeader"
	| "columnHeaderLabel"
	| "columnHeaderSubLabel"
	| "rowHeader"
	| "cell"
	| "addHint"
	| "extraRowHeader"
	| "extraCell"
	| "badge"
	| "extraCellAddHint";

export interface MatrixGridProps<TCell> {
	/**
	 * The columns, left to right. Their keys address the cells of every row.
	 */
	columns: MatrixColumn[];
	/**
	 * The rows, top to bottom
	 */
	rows: MatrixRow<TCell>[];
	/**
	 * Contents of the sticky top-left cell
	 */
	corner?: React.ReactNode;
	/**
	 * Renders the sticky first cell of a row. Everything the row header shows
	 * is the consumer's: a name, an avatar, its own action buttons.
	 */
	renderRowHeader: (
		row: MatrixRow<TCell>,
		context: MatrixRowHeaderContext,
	) => React.ReactNode;
	/**
	 * Renders the contents of one cell. Called for every row/column pair, with
	 * cell undefined where the row has no entry.
	 * @remarks Not called again while the pointer sweeps a range: the grid
	 * paints the selection itself, over the contents.
	 */
	renderCell: (
		cell: TCell | undefined,
		context: MatrixCellContext<TCell>,
	) => React.ReactNode;
	/**
	 * Renders a column header's contents instead of label/subLabel
	 */
	renderColumnHeader?: (column: MatrixColumn) => React.ReactNode;
	/**
	 * Wraps the contents of every cell. Use it to make a cell a drop target
	 * without this component depending on a drag & drop library — the wrapper
	 * should fill the cell (width and height 100%) so it covers the same area.
	 */
	renderCellWrapper?: (
		node: React.ReactNode,
		context: MatrixCellContext<TCell>,
	) => React.ReactNode;
	/**
	 * Width of one column in px
	 * @default 46
	 */
	columnWidth?: number;
	/**
	 * Height of one row in px
	 * @default 58
	 */
	rowHeight?: number;
	/**
	 * Width of the sticky row header column in px
	 * @default 116
	 */
	rowHeaderWidth?: number;
	/**
	 * Height of the column header row in px
	 * @default 42
	 */
	headerHeight?: number;
	/**
	 * Height of an extra row in px
	 * @default 48
	 */
	extraRowHeight?: number;
	/**
	 * Maximum height of the scroll container
	 * @default "70vh"
	 */
	maxHeight?: number | string;
	/**
	 * Ref to the scroll container, so a consumer can preserve the scroll
	 * position across data updates
	 */
	scrollRef?: React.RefObject<HTMLDivElement | null>;
	/**
	 * Scroll this column into view on mount and whenever the columns change
	 * @default the first column with the "current" variant
	 */
	scrollToColumn?: string;
	/**
	 * Let the user sweep a range of cells in one row (press, drag, release) and
	 * report it via onSelectRange. A plain click reports a single cell.
	 * @remarks Left button only.
	 */
	selectable?: boolean;
	/**
	 * Which cells a range may start on or run through
	 * @default cells the row has no entry for
	 * @remarks A cell can be selectable AND non-empty: a cell holding only
	 * entries that are none of the consumer's business still accepts a new one.
	 * The hover hint then shrinks to the cell's bottom half.
	 *
	 * A sweep stops at the first cell this rejects, so a reported range is
	 * always contiguous and always exactly what was highlighted.
	 */
	isCellSelectable?: (
		cell: TCell | undefined,
		context: MatrixCellContext<TCell>,
	) => boolean;
	/**
	 * Whether a cell renders anything at all — decides whether the hover hint
	 * takes the whole cell or only its bottom half
	 * @default cells the row has an entry for
	 */
	isCellOccupied?: (
		cell: TCell | undefined,
		context: MatrixCellContext<TCell>,
	) => boolean;
	/**
	 * Called when the user finishes sweeping a range
	 */
	onSelectRange?: (selection: MatrixRangeSelection) => void;
	/**
	 * Label of the hover hint on a selectable cell
	 */
	addLabel?: React.ReactNode;
	/**
	 * Touch devices have no hover and no room for small buttons: when this is
	 * set, the whole row header becomes one tap target calling it (the consumer
	 * opens a menu listing what the header's buttons do on a desktop), and the
	 * hover hint on cells is turned off. Desktop is unaffected.
	 * @remarks Give the rows a label so that button has an accessible name.
	 */
	onRowHeaderActions?: (rowKey: string) => void;
	/**
	 * Aggregate rows: one badge per column, no cells
	 */
	extraRows?: MatrixExtraRow[];
	/**
	 * Where the extra rows go
	 * @default "bottom"
	 */
	extraRowsPosition?: "top" | "bottom";
	/**
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<MatrixGridClassKey, string>>;
}

/**
 * The grid's resolved props, so every part can read what it needs at its own
 * level instead of having callbacks and class names drilled through the tree
 * (and compared by every memo on the way down).
 */
export const MatrixPropsContext = React.createContext<
	MatrixGridProps<unknown> | undefined
>(undefined);

export const useMatrixProps = <TCell>(): MatrixGridProps<TCell> => {
	const ctx = useContext(MatrixPropsContext);
	if (!ctx) throw new Error("Matrix props context not set");
	// The context cannot be generic; the grid puts its own props in and every
	// consumer reads them back with the same TCell it was rendered for.
	return ctx as unknown as MatrixGridProps<TCell>;
};
