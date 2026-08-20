import React, { useContext } from "react";
import { MatrixRangeSelection } from "./types";

/** Bit of the cell state: the cell is inside the range being swept. */
export const MATRIX_CELL_SELECTED = 1;
/** Bit of the cell state: the cell shows the "add" hint. */
export const MATRIX_CELL_ADD_HINT = 2;

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
export class MatrixInteractionStore {
	private listeners = new Set<() => void>();
	private config: MatrixInteractionConfig = {
		columnKeys: [],
		canSelect: () => false,
		touch: false,
	};
	private indexByKey = new Map<string, number>();
	private dragging = false;
	private rowKey: string | null = null;
	private anchorKey: string | null = null;
	private focusKey: string | null = null;
	/** resolved bounds of the current range, so getCellState stays a compare */
	private from = -1;
	private to = -1;
	private hoverRowKey: string | null = null;
	private hoverColumnKey: string | null = null;

	/**
	 * Publishes the current props to the store. Called by the grid on every
	 * render, so a pointer event always sees the columns on screen.
	 */
	configure(config: MatrixInteractionConfig): void {
		this.config = config;
		this.indexByKey = new Map(
			config.columnKeys.map((key, index) => [key, index]),
		);
		// the columns may have moved under a held button
		this.resolveBounds();
	}

	subscribe = (listener: () => void): (() => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	private notify(): void {
		this.listeners.forEach((listener) => listener());
	}

	isDragging(): boolean {
		return this.dragging;
	}

	/**
	 * The state of one cell, as a bit mask of MATRIX_CELL_*.
	 * @remarks A number, so useSyncExternalStore can compare snapshots and skip
	 * the re-render of every cell the pointer did not touch.
	 */
	getCellState = (rowKey: string, columnKey: string): number => {
		let state = 0;
		if (this.dragging && this.rowKey === rowKey && this.from >= 0) {
			const index = this.indexByKey.get(columnKey) ?? -1;
			if (index >= this.from && index <= this.to) state |= MATRIX_CELL_SELECTED;
		}
		if (
			!this.dragging &&
			!this.config.touch &&
			this.hoverRowKey === rowKey &&
			this.hoverColumnKey === columnKey
		)
			state |= MATRIX_CELL_ADD_HINT;
		return state;
	};

	private indexOf(columnKey: string | null): number {
		return columnKey === null ? -1 : (this.indexByKey.get(columnKey) ?? -1);
	}

	/**
	 * How far a range from `anchor` towards `target` may reach: the last index
	 * before the first cell canSelect rejects.
	 * @remarks The single source of the clamp, so what a sweep paints and what
	 * it reports cannot drift apart — not even when the data changed under a
	 * held button and no pointer event fired in between.
	 */
	private resolveFocus(rowKey: string, anchor: number, target: number): number {
		if (target === anchor) return anchor;
		const step = target > anchor ? 1 : -1;
		let focus = anchor;
		for (
			let i = anchor + step;
			step > 0 ? i <= target : i >= target;
			i += step
		) {
			if (!this.config.canSelect(rowKey, i)) break;
			focus = i;
		}
		return focus;
	}

	/** Recomputes the painted bounds from the anchor and focus keys. */
	private resolveBounds(): void {
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
	begin(rowKey: string, columnKey: string): void {
		if (!this.indexByKey.has(columnKey)) return;
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
	enter(rowKey: string, columnKey: string): void {
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
	leave(rowKey: string, columnKey: string): void {
		if (this.hoverRowKey === rowKey && this.hoverColumnKey === columnKey) {
			this.hoverRowKey = null;
			this.hoverColumnKey = null;
			this.notify();
		}
	}

	/** Drops the range without reporting it (Escape, a lost press, unmount). */
	cancel(): void {
		if (!this.dragging) return;
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
	commit(): void {
		if (!this.dragging) return;
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
		if (rowKey === null || anchor < 0 || focus < 0) return;
		// Re-check the press cell itself, then re-walk from it: both it and the
		// cells in between may have filled up, or the whole row may have been
		// opted out, while the button was down and the pointer stood still.
		if (!this.config.canSelect(rowKey, anchor)) return;
		const reachable = this.resolveFocus(rowKey, anchor, focus);
		const columnKeys = this.config.columnKeys.slice(
			Math.min(anchor, reachable),
			Math.max(anchor, reachable) + 1,
		);
		if (columnKeys.length === 0) return;
		this.config.onSelectRange?.({
			rowKey,
			fromColumnKey: columnKeys[0],
			toColumnKey: columnKeys[columnKeys.length - 1],
			columnKeys,
		});
	}
}

export const MatrixInteractionContext = React.createContext<
	MatrixInteractionStore | undefined
>(undefined);

export const useMatrixInteraction = (): MatrixInteractionStore => {
	const ctx = useContext(MatrixInteractionContext);
	if (!ctx) throw new Error("Matrix interaction context not set");
	return ctx;
};
