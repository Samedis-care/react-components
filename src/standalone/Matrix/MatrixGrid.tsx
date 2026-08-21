import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import useIsTouchOnly from "../../utils/useIsTouchOnly";
import { cssVar, matrixVars } from "./matrixClasses";
import { cellBorders } from "./matrixTints";
import {
	defaultIsCellOccupied,
	defaultIsCellSelectable,
	isCellSelectableIn,
	MatrixConfigContext,
	MatrixGridConfig,
	MatrixGridProps,
} from "./MatrixGridContext";
import {
	MatrixInteractionContext,
	MatrixInteractionStore,
} from "./MatrixInteractionContext";
import MatrixColumnHeader from "./MatrixColumnHeader";
import MatrixDataRow from "./MatrixDataRow";
import MatrixExtraRowGroup from "./MatrixExtraRowGroup";

export const MatrixGridScroller = styled("div", {
	name: "CcMatrixGrid",
	slot: "root",
})(({ theme }) => ({
	position: "relative",
	overflow: "auto",
	maxHeight: cssVar(matrixVars.maxHeight),
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: theme.shape.borderRadius,
	backgroundColor: theme.palette.background.paper,
}));

export const MatrixGridRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "grid",
})({
	display: "grid",
	width: "max-content",
});

export const MatrixCorner = styled("div", {
	name: "CcMatrixGrid",
	slot: "corner",
})(({ theme }) => ({
	position: "sticky",
	top: 0,
	left: 0,
	zIndex: 4,
	height: cssVar(matrixVars.headerHeight),
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 1),
	fontWeight: 700,
	fontSize: "0.75rem",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	backgroundColor: theme.palette.background.paper,
	...cellBorders(theme),
}));

const px = (value: number | string): string =>
	typeof value === "number" ? `${value}px` : value;

const MatrixGrid = <TCell,>(inProps: MatrixGridProps<TCell>) => {
	const props = useThemeProps({ props: inProps, name: "CcMatrixGrid" });
	const {
		columns,
		rows,
		corner,
		renderRowHeader,
		renderCell,
		renderColumnHeader,
		renderCellWrapper,
		columnWidth = 46,
		rowHeight = 58,
		rowHeaderWidth = 116,
		headerHeight = 42,
		extraRowHeight = 48,
		maxHeight = "70vh",
		scrollToColumn,
		selectable = false,
		isCellSelectable = defaultIsCellSelectable,
		isCellOccupied = defaultIsCellOccupied,
		onSelectRange,
		addLabel,
		occupiedAddAffordance = "chip",
		onRowHeaderActions,
		extraRows,
		extraRowsPosition = "bottom",
		label,
		className,
		classes,
	} = props;

	// Touch-only devices (phone, tablet): there is no hover, and sweeping a
	// range fights with scrolling — the hint would flicker and read as broken.
	// A plain tap on a cell still reports a single-cell range (mousedown plus
	// mouseup on the same cell), and the row header collapses into one target.
	const touch = useIsTouchOnly();
	const localScrollRef = useRef<HTMLDivElement>(null);
	const scrollRef = props.scrollRef ?? localScrollRef;
	const scrollTargetRef = useRef<HTMLDivElement>(null);
	const appliedScrollRef = useRef<number | null>(null);
	const store = useMemo(() => new MatrixInteractionStore(), []);

	const config = useMemo<MatrixGridConfig<TCell>>(
		() => ({
			columns,
			renderRowHeader,
			renderCell,
			renderColumnHeader,
			renderCellWrapper,
			selectable,
			isCellSelectable,
			isCellOccupied,
			addLabel,
			occupiedAddAffordance,
			onRowHeaderActions,
			classes,
			touch,
		}),
		[
			columns,
			renderRowHeader,
			renderCell,
			renderColumnHeader,
			renderCellWrapper,
			selectable,
			isCellSelectable,
			isCellOccupied,
			addLabel,
			occupiedAddAffordance,
			onRowHeaderActions,
			classes,
			touch,
		],
	);

	const columnKeys = useMemo(
		() => columns.map((column) => column.key),
		[columns],
	);
	const rowsByKey = useMemo(
		() => new Map(rows.map((row) => [row.key, row])),
		[rows],
	);
	const canSelect = useCallback(
		(rowKey: string, columnIndex: number) => {
			const row = rowsByKey.get(rowKey);
			const column = config.columns[columnIndex];
			if (!row || !column) return false;
			return isCellSelectableIn(config, row, column, columnIndex);
		},
		[rowsByKey, config],
	);

	// The store reads the props a pointer event needs from here, so no pointer
	// state has to live in this component's state (see MatrixInteractionStore).
	// An effect is early enough: it flushes before the user can reach the grid.
	useEffect(() => {
		store.configure({ columnKeys, canSelect, touch, onSelectRange });
	}, [store, columnKeys, canSelect, touch, onSelectRange]);

	useEffect(() => {
		if (!selectable) return;
		const onUp = (event: MouseEvent) => {
			// Any other button ends the press without reporting it. Leaving the
			// store dragging would arm a stale range that the next left click
			// anywhere on the page would then commit.
			if (event.button !== 0) store.cancel();
			else store.commit();
		};
		const cancel = () => {
			store.cancel();
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") store.cancel();
		};
		window.addEventListener("mouseup", onUp);
		window.addEventListener("keydown", onKey);
		// A press that ends outside the window, in a context menu, or as a
		// cancelled touch never produces a mouseup we would hear.
		window.addEventListener("blur", cancel);
		window.addEventListener("contextmenu", cancel);
		window.addEventListener("pointercancel", cancel);
		return () => {
			window.removeEventListener("mouseup", onUp);
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("blur", cancel);
			window.removeEventListener("contextmenu", cancel);
			window.removeEventListener("pointercancel", cancel);
			// Selection being switched off (or the grid unmounting) mid-press
			// would otherwise leave a range armed with no listener left to end
			// or abort it — and the cells painted with no way to clear them.
			store.cancel();
		};
	}, [store, selectable]);

	// Scroll the marked column just past the sticky row header column.
	// The fallback also catches a scrollToColumn that is no longer in the set —
	// a consumer holding a key in state while the window rolls past it would
	// otherwise get no target at all and open at the far left.
	const target =
		(scrollToColumn !== undefined &&
		columns.some((column) => column.key === scrollToColumn)
			? scrollToColumn
			: undefined) ??
		columns.find((column) => column.variant === "current")?.key;
	// Keyed on where the target sits, not on the identity of the columns array:
	// a consumer that builds its columns inline would otherwise have the user's
	// scroll position reset on every render, and a rolling window that keeps its
	// length would never scroll at all. The guard on the last applied value
	// leaves manual scrolling alone when something else re-runs this.
	const targetIndex = columns.findIndex((column) => column.key === target);
	useLayoutEffect(() => {
		const scroller = scrollRef.current;
		const cell = scrollTargetRef.current;
		if (!scroller || !cell) return;
		const next = Math.max(0, cell.offsetLeft - rowHeaderWidth - columnWidth);
		if (appliedScrollRef.current === next) return;
		appliedScrollRef.current = next;
		scroller.scrollLeft = next;
	}, [
		target,
		targetIndex,
		columns.length,
		columnWidth,
		rowHeaderWidth,
		scrollRef,
	]);

	const rootStyle = useMemo(
		() =>
			({
				[matrixVars.rowHeight]: px(rowHeight),
				[matrixVars.headerHeight]: px(headerHeight),
				[matrixVars.extraRowHeight]: px(extraRowHeight),
				[matrixVars.maxHeight]: px(maxHeight),
			}) as React.CSSProperties,
		[rowHeight, headerHeight, extraRowHeight, maxHeight],
	);
	const gridStyle = useMemo(
		() => ({
			// repeat() needs a positive integer: repeat(0, …) makes the whole
			// declaration invalid, and an empty grid would collapse into one
			// implicit column instead of just being empty.
			gridTemplateColumns: columns.length
				? `${px(rowHeaderWidth)} repeat(${columns.length}, ${px(columnWidth)})`
				: px(rowHeaderWidth),
		}),
		[rowHeaderWidth, columns.length, columnWidth],
	);

	const extra = useMemo(
		() =>
			(extraRows ?? []).map((extraRow) => (
				<MatrixExtraRowGroup key={extraRow.key} extraRow={extraRow} />
			)),
		[extraRows],
	);

	return (
		// the cast is one-directional: reading it back is type-safe (see
		// useMatrixConfig), only handing a TCell config to an unknown context is not
		<MatrixConfigContext.Provider
			value={config as unknown as MatrixGridConfig<unknown>}
		>
			<MatrixInteractionContext.Provider value={store}>
				<MatrixGridScroller
					ref={scrollRef}
					className={combineClassNames([className, classes?.root])}
					style={rootStyle}
					// the grid scrolls further than one screen: without this it
					// is unreachable past the first columns without a pointer
					tabIndex={0}
					role={label ? "region" : undefined}
					aria-label={label}
				>
					<MatrixGridRoot className={classes?.grid} style={gridStyle}>
						<MatrixCorner className={classes?.corner}>{corner}</MatrixCorner>
						{columns.map((column) => (
							<MatrixColumnHeader
								key={column.key}
								column={column}
								innerRef={column.key === target ? scrollTargetRef : undefined}
							/>
						))}
						{extraRowsPosition === "top" && extra}
						{rows.map((row) => (
							<MatrixDataRow key={row.key} row={row} />
						))}
						{extraRowsPosition === "bottom" && extra}
					</MatrixGridRoot>
				</MatrixGridScroller>
			</MatrixInteractionContext.Provider>
		</MatrixConfigContext.Provider>
	);
};

// React.memo drops the generic parameter (its typing collapses TCell to
// unknown), so the memoized component is cast back to the generic signature.
// Behaviour is unchanged, only the type survives.
export default React.memo(MatrixGrid) as typeof MatrixGrid;
