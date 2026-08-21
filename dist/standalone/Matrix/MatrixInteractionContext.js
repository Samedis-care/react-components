import React, { useContext } from "react";
/** Bit of the cell state: the cell is inside the range being swept. */
export const MATRIX_CELL_SELECTED = 1;
/** Bit of the cell state: the cell shows the "add" hint. */
export const MATRIX_CELL_ADD_HINT = 2;
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
export class MatrixInteractionStore {
    listeners = new Set();
    config = {
        columnKeys: [],
        canSelect: () => false,
        touch: false,
    };
    indexByKey = new Map();
    dragging = false;
    rowKey = null;
    anchorKey = null;
    focusKey = null;
    /** resolved bounds of the current range, so getCellState stays a compare */
    from = -1;
    to = -1;
    hoverRowKey = null;
    hoverColumnKey = null;
    /**
     * Publishes the current props to the store. Called by the grid on every
     * render, so a pointer event always sees the columns on screen.
     */
    configure(config) {
        this.config = config;
        this.indexByKey = new Map(config.columnKeys.map((key, index) => [key, index]));
        // the columns may have moved under a held button
        this.resolveBounds();
    }
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };
    notify() {
        this.listeners.forEach((listener) => listener());
    }
    isDragging() {
        return this.dragging;
    }
    /**
     * The state of one cell, as a bit mask of MATRIX_CELL_*.
     * @remarks A number, so useSyncExternalStore can compare snapshots and skip
     * the re-render of every cell the pointer did not touch.
     */
    getCellState = (rowKey, columnKey) => {
        let state = 0;
        if (this.dragging && this.rowKey === rowKey && this.from >= 0) {
            const index = this.indexByKey.get(columnKey) ?? -1;
            if (index >= this.from && index <= this.to)
                state |= MATRIX_CELL_SELECTED;
        }
        if (!this.dragging &&
            !this.config.touch &&
            this.hoverRowKey === rowKey &&
            this.hoverColumnKey === columnKey &&
            // A hint on a cell where a range cannot start advertises an action
            // that does not exist — and in overlay mode it would even catch the
            // press. The index lookup is a map hit, so this stays cheap.
            this.config.canSelect(rowKey, this.indexByKey.get(columnKey) ?? -1))
            state |= MATRIX_CELL_ADD_HINT;
        return state;
    };
    indexOf(columnKey) {
        return columnKey === null ? -1 : (this.indexByKey.get(columnKey) ?? -1);
    }
    /**
     * How far a range from `anchor` towards `target` may reach: the last index
     * before the first cell canSelect rejects.
     * @remarks The single source of the clamp, so what a sweep paints and what
     * it reports cannot drift apart — not even when the data changed under a
     * held button and no pointer event fired in between.
     */
    resolveFocus(rowKey, anchor, target) {
        if (target === anchor)
            return anchor;
        const step = target > anchor ? 1 : -1;
        let focus = anchor;
        for (let i = anchor + step; step > 0 ? i <= target : i >= target; i += step) {
            if (!this.config.canSelect(rowKey, i))
                break;
            focus = i;
        }
        return focus;
    }
    /** Recomputes the painted bounds from the anchor and focus keys. */
    resolveBounds() {
        const anchor = this.indexOf(this.anchorKey);
        const focus = this.indexOf(this.focusKey);
        if (!this.dragging || anchor < 0 || focus < 0) {
            this.from = -1;
            this.to = -1;
            return;
        }
        this.from = Math.min(anchor, focus);
        this.to = Math.max(anchor, focus);
    }
    /** Begins a range on a cell. */
    begin(rowKey, columnKey) {
        if (!this.indexByKey.has(columnKey))
            return;
        this.dragging = true;
        this.rowKey = rowKey;
        this.anchorKey = columnKey;
        this.focusKey = columnKey;
        this.resolveBounds();
        this.notify();
    }
    /**
     * Moves the pointer onto a cell: extends (or shrinks) the range if one is
     * being swept, and remembers the hover for the add hint.
     * @remarks A range stops at the first cell canSelect rejects, so what is
     * highlighted is exactly what gets reported.
     */
    enter(rowKey, columnKey) {
        this.hoverRowKey = rowKey;
        this.hoverColumnKey = columnKey;
        if (this.dragging && this.rowKey === rowKey) {
            const anchor = this.indexOf(this.anchorKey);
            const target = this.indexOf(columnKey);
            if (anchor >= 0 && target >= 0) {
                this.focusKey =
                    this.config.columnKeys[this.resolveFocus(rowKey, anchor, target)] ??
                        this.anchorKey;
                this.resolveBounds();
            }
        }
        this.notify();
    }
    /** The pointer left a cell. */
    leave(rowKey, columnKey) {
        if (this.hoverRowKey === rowKey && this.hoverColumnKey === columnKey) {
            this.hoverRowKey = null;
            this.hoverColumnKey = null;
            this.notify();
        }
    }
    /**
     * Reports one cell as a range, without a press.
     * @remarks For an affordance that is its own button (the add chip on a cell
     * whose contents would swallow a press) rather than a place to start a drag.
     */
    selectSingle(rowKey, columnKey) {
        const index = this.indexByKey.get(columnKey);
        if (index === undefined)
            return;
        if (!this.config.canSelect(rowKey, index))
            return;
        this.config.onSelectRange?.({
            rowKey,
            fromColumnKey: columnKey,
            toColumnKey: columnKey,
            columnKeys: [columnKey],
        });
    }
    /** Drops the range without reporting it (Escape, a lost press, unmount). */
    cancel() {
        if (!this.dragging)
            return;
        this.dragging = false;
        this.rowKey = null;
        this.anchorKey = null;
        this.focusKey = null;
        this.resolveBounds();
        this.notify();
    }
    /**
     * Ends a range and reports it. The hover is left alone: the pointer is
     * still on the cell it was released over.
     */
    commit() {
        if (!this.dragging)
            return;
        const rowKey = this.rowKey;
        const anchor = this.indexOf(this.anchorKey);
        const focus = this.indexOf(this.focusKey);
        this.dragging = false;
        this.rowKey = null;
        this.anchorKey = null;
        this.focusKey = null;
        this.resolveBounds();
        this.notify();
        // A column that disappeared mid-press takes the range with it.
        if (rowKey === null || anchor < 0 || focus < 0)
            return;
        // Re-check the press cell itself, then re-walk from it: both it and the
        // cells in between may have filled up, or the whole row may have been
        // opted out, while the button was down and the pointer stood still.
        if (!this.config.canSelect(rowKey, anchor))
            return;
        const reachable = this.resolveFocus(rowKey, anchor, focus);
        const columnKeys = this.config.columnKeys.slice(Math.min(anchor, reachable), Math.max(anchor, reachable) + 1);
        if (columnKeys.length === 0)
            return;
        this.config.onSelectRange?.({
            rowKey,
            fromColumnKey: columnKeys[0],
            toColumnKey: columnKeys[columnKeys.length - 1],
            columnKeys,
        });
    }
}
export const MatrixInteractionContext = React.createContext(undefined);
export const useMatrixInteraction = () => {
    const ctx = useContext(MatrixInteractionContext);
    if (!ctx)
        throw new Error("Matrix interaction context not set");
    return ctx;
};
