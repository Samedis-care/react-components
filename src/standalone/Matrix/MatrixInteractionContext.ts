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
 */
export class MatrixInteractionStore {
	private listeners = new Set<() => void>();
	private config: MatrixInteractionConfig = {
		columnKeys: [],
		canSelect: () => false,
		touch: false,
	};
	private dragging = false;
	private rowKey: string | null = null;
	private anchorKey: string | null = null;
	private focusKey: string | null = null;
	private hoverRowKey: string | null = null;
	private hoverColumnKey: string | null = null;

	/**
	 * Publishes the current props to the store. Called by the grid on every
	 * render, so a pointer event always sees the columns on screen.
	 */
	configure(config: MatrixInteractionConfig): void {
		this.config = config;
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
	getCellState = (rowKey: string, columnIndex: number): number => {
		let state = 0;
		if (this.dragging && this.rowKey === rowKey) {
			const anchor = this.indexOf(this.anchorKey);
			const focus = this.indexOf(this.focusKey);
			if (
				anchor >= 0 &&
				focus >= 0 &&
				columnIndex >= Math.min(anchor, focus) &&
				columnIndex <= Math.max(anchor, focus)
			)
				state |= MATRIX_CELL_SELECTED;
		}
		if (
			!this.dragging &&
			!this.config.touch &&
			this.hoverRowKey === rowKey &&
			this.hoverColumnKey === this.config.columnKeys[columnIndex] &&
			this.config.canSelect(rowKey, columnIndex)
		)
			state |= MATRIX_CELL_ADD_HINT;
		return state;
	};

	private indexOf(columnKey: string | null): number {
		return columnKey === null ? -1 : this.config.columnKeys.indexOf(columnKey);
	}

	/** Begins a range on a cell. */
	begin(rowKey: string, columnIndex: number): void {
		const columnKey = this.config.columnKeys[columnIndex];
		if (columnKey === undefined) return;
		this.dragging = true;
		this.rowKey = rowKey;
		this.anchorKey = columnKey;
		this.focusKey = columnKey;
		this.notify();
	}

	/**
	 * Moves the pointer onto a cell: extends the range if one is being swept,
	 * and remembers the hover for the add hint.
	 * @remarks A range stops at the first cell canSelect rejects, so what is
	 * highlighted is exactly what gets reported.
	 */
	enter(rowKey: string, columnIndex: number): void {
		this.hoverRowKey = rowKey;
		this.hoverColumnKey = this.config.columnKeys[columnIndex] ?? null;
		if (this.dragging && this.rowKey === rowKey) {
			const anchor = this.indexOf(this.anchorKey);
			if (anchor >= 0 && columnIndex !== anchor) {
				const step = columnIndex > anchor ? 1 : -1;
				let focus = anchor;
				for (
					let i = anchor + step;
					step > 0 ? i <= columnIndex : i >= columnIndex;
					i += step
				) {
					if (!this.config.canSelect(rowKey, i)) break;
					focus = i;
				}
				this.focusKey = this.config.columnKeys[focus] ?? this.anchorKey;
			}
		}
		this.notify();
	}

	/** The pointer left a cell. */
	leave(rowKey: string, columnIndex: number): void {
		if (
			this.hoverRowKey === rowKey &&
			this.hoverColumnKey === this.config.columnKeys[columnIndex]
		) {
			this.hoverRowKey = null;
			this.hoverColumnKey = null;
			this.notify();
		}
	}

	/** Drops the range without reporting it (Escape). */
	cancel(): void {
		if (!this.dragging) return;
		this.dragging = false;
		this.rowKey = null;
		this.anchorKey = null;
		this.focusKey = null;
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
		this.notify();
		// A column that disappeared mid-press takes the range with it.
		if (rowKey === null || anchor < 0 || focus < 0) return;
		const columnKeys = this.config.columnKeys.slice(
			Math.min(anchor, focus),
			Math.max(anchor, focus) + 1,
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
