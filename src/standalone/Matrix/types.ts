import React from "react";

/**
 * How a column is tinted. The concrete colors come from the theme, so a
 * consumer never has to know them:
 * - normal: no tint
 * - muted: a de-emphasized column (a weekend in a calendar, a closed day, ...)
 * - current: the column the grid scrolls to by default (today in a calendar)
 * - accent: a column the consumer wants to point at (the date a request is for)
 */
export type MatrixColumnVariant = "normal" | "muted" | "current" | "accent";

export interface MatrixColumn {
	/**
	 * Identifies the column. Used as the key of the cell records of every row,
	 * so it has to be unique within one grid.
	 */
	key: string;
	/**
	 * The column header's main line (a day number in a calendar)
	 */
	label: React.ReactNode;
	/**
	 * The column header's second line, rendered smaller (a weekday name)
	 */
	subLabel?: React.ReactNode;
	/**
	 * The column in words, for assistive technology: the full date in a
	 * calendar ("Thursday, March 5, 2026"), where label and subLabel only show
	 * "5" and "Thu". The add chips of the column's cells say it in their
	 * accessible name (see MatrixGridProps.addLabel). buildDateColumns sets it.
	 * @default label, if that is a string or a number; nothing otherwise
	 */
	name?: string;
	/**
	 * How the whole column is tinted
	 * @default "normal"
	 */
	variant?: MatrixColumnVariant;
}

export interface MatrixRow<TCell> {
	/**
	 * Identifies the row. Has to be unique within one grid.
	 */
	key: string;
	/**
	 * The row's cells, keyed by column key. Columns without an entry render an
	 * empty cell.
	 */
	cells: Record<string, TCell>;
	/**
	 * Accessible name of the row (a person's name). The add chips of the row's
	 * cells say it in their accessible name (see MatrixGridProps.addLabel), and
	 * it names the row header when that becomes a single button in touch mode
	 * (see MatrixGridProps.onRowHeaderActions). Without it, the chips do not
	 * say their row, and that button is announced by whatever the header
	 * renders.
	 */
	label?: string;
	/**
	 * Opt this single row out of range selection, whatever the grid's
	 * selectable prop says (a row that cannot receive new entries)
	 * @default true
	 */
	selectable?: boolean;
}

/**
 * A row that holds no cells of its own, only a badge per column. Used for
 * aggregate rows (open demand per day, totals, ...). Rendered below the data
 * rows unless MatrixGridProps.extraRowsPosition says otherwise.
 */
export interface MatrixExtraRow {
	/**
	 * Identifies the row. Has to be unique within one grid.
	 */
	key: string;
	/**
	 * Contents of the sticky row header cell
	 */
	header: React.ReactNode;
	/**
	 * Accessible name of the row, used for its cells when they report clicks
	 * (and as the fallback when getCellLabel is not given)
	 */
	label?: string;
	/**
	 * Accessible name of one cell of this row — the row's subject plus the
	 * column it stands for ("post a request for March 5th"). Falls back to
	 * label.
	 */
	getCellLabel?: (columnKey: string) => string;
	/**
	 * What to show per column, keyed by column key. An entry that is missing or
	 * null renders no badge — with onCellClick set, the cell then shows the same
	 * "add" hint on hover that an empty selectable cell does.
	 * @remarks Zero is a value, not a blank: a badge of 0 renders as a badge.
	 */
	badges?: Record<string, React.ReactNode>;
	/**
	 * Called with the column key when a cell of this row is clicked
	 */
	onCellClick?: (columnKey: string) => void;
}

export interface MatrixCellContext<TCell> {
	/**
	 * The row this cell belongs to
	 */
	row: MatrixRow<TCell>;
	/**
	 * The column this cell belongs to
	 */
	column: MatrixColumn;
	/**
	 * Index of the column in the columns prop
	 */
	columnIndex: number;
}

export interface MatrixRowHeaderContext {
	/**
	 * True while the whole row header is one tap target calling
	 * onRowHeaderActions, so the renderer should not offer its own buttons:
	 * on a touch-only device (coarse pointer, no hover) with
	 * onRowHeaderActions set. False on other devices, and on a touch-only
	 * device without onRowHeaderActions, where the renderer's own buttons are
	 * the way to the row's actions.
	 */
	touch: boolean;
}

export interface MatrixRangeSelection {
	/**
	 * The row the range was drawn in — a range never spans rows
	 */
	rowKey: string;
	/**
	 * First column of the range, in column order (NOT the column the drag
	 * started on — that may be the last one)
	 */
	fromColumnKey: string;
	/**
	 * Last column of the range, in column order
	 */
	toColumnKey: string;
	/**
	 * Every column key the range covers, in column order. Always contiguous: a
	 * sweep stops at the first cell isCellSelectable rejects, so what was
	 * highlighted is what is reported. A plain click produces a single-entry
	 * range.
	 */
	columnKeys: string[];
}

/**
 * One entry inside a cell tile. Colors are passed in rather than derived: they
 * usually come from the record the entry represents.
 */
export interface MatrixTileItem {
	/**
	 * Identifies the entry within its cell
	 */
	key: string;
	/**
	 * The entry's main label (a short code)
	 */
	label: React.ReactNode;
	/**
	 * A second label, rendered after an arrow ("A -> B"). Use it for an entry
	 * that points somewhere: an assignment, a hand-over, a target.
	 * @remarks Not rendered in a diagonal pair, see MatrixCellTileProps.pairLayout.
	 */
	secondaryLabel?: React.ReactNode;
	/**
	 * Direction of the arrow between label and secondaryLabel
	 * @default "vertical"
	 */
	flow?: "horizontal" | "vertical";
	/**
	 * Fill color of the entry. Any CSS color. A translucent fill shows over the
	 * cell beneath it.
	 * @remarks Without textColor the label color is derived from this, which
	 * needs a color that can be resolved in JavaScript: hex, rgb(), hsl() or a
	 * keyword. Pass textColor with a var().
	 */
	backgroundColor: string;
	/**
	 * Text (and adornment) color of the entry
	 * @default black or white, whichever has the higher contrast with
	 * backgroundColor (at least 4.5:1). A translucent backgroundColor is
	 * measured over the theme's palette.background.paper. A backgroundColor
	 * that cannot be resolved (a var()) gets none: the entry then inherits the
	 * surrounding text color.
	 */
	textColor?: string;
	/**
	 * Render the entry de-emphasized (it is informational, not actionable)
	 */
	dimmed?: boolean;
	/**
	 * Ring the entry to draw attention to it (recently created, matching a
	 * search, ...)
	 */
	highlighted?: boolean;
	/**
	 * Small adornments pinned into the entry's corners. Keep them to a single
	 * icon each — a cell is tiny.
	 * @remarks A diagonal pair renders only the first entry's bottomLeft corner,
	 * see MatrixCellTileProps.pairLayout.
	 */
	corners?: Partial<Record<MatrixTileCorner, React.ReactNode>>;
	/**
	 * Tooltip shown when hovering the entry, or focusing a clickable one.
	 * It is also the entry's accessible description: screen readers read it
	 * after the name, which stays the label. In a diagonal pair both tooltips
	 * are joined with " / ". Without it no tooltip is mounted at all.
	 */
	tooltip?: string;
}

export type MatrixTileCorner =
	"topLeft" | "topRight" | "bottomLeft" | "bottomRight";
