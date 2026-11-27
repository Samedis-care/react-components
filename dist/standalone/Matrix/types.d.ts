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
     * accessible name (see MatrixGridProps.addLabel), as do the cells of an
     * aggregate row without getCellLabel (see MatrixExtraRow.label).
     * buildDateColumns sets it.
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
     * (see MatrixGridProps.onRowHeaderActions); everything the header renders
     * is then part of the button's description. Without it, the chips do not
     * say their row, and that button is named by whatever the header renders.
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
     * Accessible name of the row ("Open demand"), used for its cells when they
     * report clicks. Without getCellLabel, a cell is named by this and the
     * column's name (MatrixColumn.name), joined with a comma: "Open demand,
     * Thursday, March 5, 2026".
     * @default header, if that is a string or a number; nothing otherwise
     */
    label?: string;
    /**
     * Accessible name of one cell of this row — the row's subject plus the
     * column it stands for ("post a request for March 5th"). A cell that shows
     * a badge is announced with the badge first: "2 post a request for March
     * 5th".
     * @default label and the column's name, see label. A cell whose row and
     * column have no name either is named by its badge, or "Add" (in the
     * current language) for the "+" it shows without one. Used as well when
     * this returns an empty string.
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
     * @remarks Outside a diagonal pair, a string or a number is drawn the
     * smaller the more characters it has (a number counts its digits, so 1234
     * is drawn like "1234"); any other node at the largest size.
     *
     * What does not fit the entry at that size is drawn smaller: the label,
     * the arrow and the secondaryLabel together, as far as they need, but no
     * text below 8px, so what is wider even then is cut. They follow the room
     * the entry has and the text spacing a user sets (WCAG 1.4.12). At
     * MatrixGrid's default columnWidth and rowHeight, codes of up to three
     * characters fit an entry of a split pair, and up to six an entry alone
     * in its tile.
     */
    label: React.ReactNode;
    /**
     * A second label, rendered after an arrow ("A -> B"). Use it for an entry
     * that points somewhere: an assignment, a hand-over, a target. Screen
     * readers say the arrow as a word, in the page's language: "A to B". An
     * icon as secondaryLabel is said only if it has a name of its own
     * (titleAccess on a MUI icon).
     * @remarks Not rendered in a diagonal pair, see MatrixCellTileProps.pairLayout.
     */
    secondaryLabel?: React.ReactNode;
    /**
     * Direction of the arrow between label and secondaryLabel: "vertical"
     * puts the secondaryLabel below the label, "horizontal" beside it
     * @remarks An entry of a split pair stacked one above the other
     * (MatrixCellTileProps.splitDirection "column") always puts it beside the
     * label: it is half the row high, too low for the label, the arrow and the
     * secondaryLabel one below the other.
     * @default "vertical"
     */
    flow?: "horizontal" | "vertical";
    /**
     * Fill color of the entry. Any CSS color. A translucent fill shows over the
     * cell beneath it.
     * @remarks Without textColor the label color is derived from this, which
     * needs a color that can be resolved: any CSS color but a var() or
     * currentcolor (oklch(), lab(), color-mix() and color() in a space other
     * than srgb where the browser paints them on a canvas, not in jsdom). Pass
     * textColor with a var().
     */
    backgroundColor: string;
    /**
     * Text (and adornment) color of the entry
     * @default black or white, whichever has the higher contrast with
     * backgroundColor (at least 4.5:1). A translucent backgroundColor is
     * measured over the theme's palette.background.paper. A backgroundColor
     * that cannot be resolved (a var()) gets none: the entry then inherits the
     * surrounding text color.
     * @remarks A dimmed entry uses it only if its fill cannot be faded, see
     * dimmed.
     */
    textColor?: string;
    /**
     * Render the entry de-emphasized (someone else's, informational): its
     * fill is faded to MATRIX_TILE_DIM_OPACITY, in a split and a diagonal
     * pair alike. The label, the secondary label and the corners are not
     * faded. The label is black or white, whichever has the higher contrast
     * with the faded fill as it shows over the theme's
     * palette.background.paper (at least 4.5:1); textColor, meant for the
     * full fill, is not used. Screen readers say "dimmed", in the page's
     * language, after the entry's label. In forced-colors mode, which draws
     * no fills, a dimmed entry outside a diagonal pair has a dashed border
     * instead of a solid one.
     *
     * Dimming changes nothing else: with MatrixCellTileProps.onItemClick a
     * dimmed entry is a button like any other.
     * @remarks A backgroundColor that cannot be resolved (a var()) is not
     * faded, and keeps textColor.
     * @default false
     */
    dimmed?: boolean;
    /**
     * Ring the entry to draw attention to it (recently created, matching a
     * search, ...). The ring is the theme's palette.warning.main, darkened (in
     * a dark theme: lightened) where it needs that for 3:1 on today's column,
     * with a line of palette.background.paper between it and the entry's
     * fill. In forced-colors mode it is an outline in the Highlight system
     * color. Screen readers say "highlighted", in the page's language, after
     * the entry's label.
     * @default false
     */
    highlighted?: boolean;
    /**
     * Small adornments pinned into the entry's corners. Keep them to a single
     * icon each — a cell is tiny. A corner is drawn for any value but null,
     * undefined, a boolean and an empty string, so 0 (a counter) shows, and
     * `flag && <Icon />` leaves the corner empty. An adornment that sets no
     * color of its own (MUI icons inherit theirs) is drawn in the entry's text
     * color, as its label is (see textColor).
     * @remarks A diagonal pair renders only the first entry's bottomLeft corner,
     * in that entry's text color, see MatrixCellTileProps.pairLayout.
     *
     * In a cell that shows MatrixGrid's add chip, the chip lies over the last
     * entry's bottomRight corner while it shows (see
     * MatrixGridProps.occupiedAddAffordance).
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
export type MatrixTileCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
