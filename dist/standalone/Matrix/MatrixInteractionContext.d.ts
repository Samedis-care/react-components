import React from "react";
import { MatrixRangeSelection } from "./types";
/** Bit of the cell state: the cell is inside the range being swept. */
export declare const MATRIX_CELL_SELECTED = 1;
/** Bit of the cell state: the cell shows the "add" hint. */
export declare const MATRIX_CELL_ADD_HINT = 2;
export interface MatrixInteractionConfig {
    /** Current column keys, in column order */
    columnKeys: string[];
    /** May a range start on, or run through, this cell? */
    canSelect: (rowKey: string, columnIndex: number) => boolean;
    /** Touch device: no hover, so no add hint */
    touch: boolean;
    /** Called with the finished range */
    onSelectRange?: (selection: MatrixRangeSelection) => void;
}
/**
 * Holds the pointer state of one grid (the range being swept, the hovered
 * cell) outside of React state.
 *
 * A sweep changes the state of a handful of cells but would re-render the whole
 * grid if it lived in the grid's own state — with the documented 400 column cap
 * that is tens of thousands of renderCell calls per pointer step. Instead every
 * cell subscribes here and reads its own state as a bit mask, so React bails
 * out on the cells whose mask did not change and the grid component itself
 * never re-renders while the pointer moves.
 *
 * The anchor and focus of a range are kept as column KEYS, not indexes: if the
 * columns change mid-press (a refetch, a shifted window) the keys either still
 * address the same columns or they are gone, in which case the range is
 * dropped, rather than silently reporting whatever now sits at those indexes.
 *
 * Reading a cell's state is O(1): the column order is a map built once per
 * configure(), and the bounds of the range are resolved when it changes rather
 * than once per cell per notification.
 */
export declare class MatrixInteractionStore {
    private listeners;
    private config;
    private indexByKey;
    private dragging;
    private rowKey;
    private anchorKey;
    private focusKey;
    /** resolved bounds of the current range, so getCellState stays a compare */
    private from;
    private to;
    private hoverRowKey;
    private hoverColumnKey;
    /**
     * Publishes the current props to the store. Called by the grid on every
     * render, so a pointer event always sees the columns on screen.
     */
    configure(config: MatrixInteractionConfig): void;
    subscribe: (listener: () => void) => (() => void);
    private notify;
    isDragging(): boolean;
    /**
     * The state of one cell, as a bit mask of MATRIX_CELL_*.
     * @remarks A number, so useSyncExternalStore can compare snapshots and skip
     * the re-render of every cell the pointer did not touch.
     */
    getCellState: (rowKey: string, columnKey: string) => number;
    private indexOf;
    /**
     * How far a range from `anchor` towards `target` may reach: the last index
     * before the first cell canSelect rejects.
     * @remarks The single source of the clamp, so what a sweep paints and what
     * it reports cannot drift apart — not even when the data changed under a
     * held button and no pointer event fired in between.
     */
    private resolveFocus;
    /** Recomputes the painted bounds from the anchor and focus keys. */
    private resolveBounds;
    /** Begins a range on a cell. */
    begin(rowKey: string, columnKey: string): void;
    /**
     * Moves the pointer onto a cell: extends (or shrinks) the range if one is
     * being swept, and remembers the hover for the add hint.
     * @remarks A range stops at the first cell canSelect rejects, so what is
     * highlighted is exactly what gets reported.
     */
    enter(rowKey: string, columnKey: string): void;
    /** The pointer left a cell. */
    leave(rowKey: string, columnKey: string): void;
    /**
     * Reports one cell as a range, without a press.
     * @remarks For an affordance that is its own button (the add chip on a cell
     * whose contents would swallow a press) rather than a place to start a drag.
     */
    selectSingle(rowKey: string, columnKey: string): void;
    /** Drops the range without reporting it (Escape, a lost press, unmount). */
    cancel(): void;
    /**
     * Ends a range and reports it. The hover is left alone: the pointer is
     * still on the cell it was released over.
     */
    commit(): void;
}
export declare const MatrixInteractionContext: React.Context<MatrixInteractionStore | undefined>;
export declare const useMatrixInteraction: () => MatrixInteractionStore;
