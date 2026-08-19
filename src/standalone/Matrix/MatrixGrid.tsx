import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { alpha, styled, Theme, useThemeProps } from "@mui/material";
import { Add } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useIsTouchOnly from "../../utils/useIsTouchOnly";
import {
	MatrixCellContext,
	MatrixColumn,
	MatrixColumnVariant,
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
	| "addAffordance"
	| "extraRowHeader"
	| "extraCell"
	| "badge"
	| "addHint";

/**
 * The tint of a column, by variant. Body cells sit in the scroll flow, so they
 * can be translucent; the sticky header and row header must NOT be — content
 * scrolls underneath them — so those layer the same tint over an opaque
 * background instead of blending with whatever passes behind.
 */
const columnTint = (
	theme: Theme,
	variant: MatrixColumnVariant,
	sticky: boolean,
): string | undefined => {
	const dark = theme.palette.mode === "dark";
	switch (variant) {
		case "muted":
			// Neutral on purpose: a de-emphasized column must not read as
			// branded, so this tints with the text color (black on a light
			// theme, white on a dark one) rather than with the palette.
			return alpha(
				theme.palette.text.primary,
				sticky ? 0.11 : dark ? 0.05 : 0.06,
			);
		case "current":
			return alpha(theme.palette.warning.main, dark ? 0.16 : 0.14);
		case "accent":
			return alpha(theme.palette.info.main, sticky ? 0.2 : dark ? 0.18 : 0.08);
		default:
			return undefined;
	}
};

const stickyBackground = (theme: Theme, variant: MatrixColumnVariant) => {
	const tint = columnTint(theme, variant, true);
	return {
		backgroundColor: theme.palette.background.paper,
		// a gradient of one flat color, layered over the opaque paper: tints the
		// cell without making it see-through
		...(tint && { backgroundImage: `linear-gradient(${tint}, ${tint})` }),
	};
};

const columnHeaderText = (
	theme: Theme,
	variant: MatrixColumnVariant,
): string | undefined => {
	switch (variant) {
		case "current":
			return theme.palette.mode === "dark"
				? theme.palette.warning.light
				: theme.palette.warning.dark;
		case "accent":
			return theme.palette.info.main;
		default:
			return undefined;
	}
};

const MatrixGridScroller = styled("div", {
	name: "CcMatrixGrid",
	slot: "root",
})<{ ownerState: { maxHeight?: number | string } }>(
	({ theme, ownerState }) => ({
		position: "relative",
		overflow: "auto",
		maxHeight: ownerState.maxHeight,
		border: `1px solid ${theme.palette.divider}`,
		borderRadius: theme.shape.borderRadius,
		backgroundColor: theme.palette.background.paper,
	}),
);

const MatrixGridRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "grid",
})<{
	ownerState: { rowHeaderWidth: number; columns: number; columnWidth: number };
}>(({ ownerState }) => ({
	display: "grid",
	gridTemplateColumns: `${ownerState.rowHeaderWidth}px repeat(${ownerState.columns}, ${ownerState.columnWidth}px)`,
	width: "max-content",
}));

const cellBorders = (theme: Theme) => ({
	borderRight: `1px solid ${theme.palette.divider}`,
	borderBottom: `1px solid ${theme.palette.divider}`,
});

const MatrixCorner = styled("div", { name: "CcMatrixGrid", slot: "corner" })<{
	ownerState: { height: number };
}>(({ theme, ownerState }) => ({
	position: "sticky",
	top: 0,
	left: 0,
	zIndex: 4,
	height: ownerState.height,
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

interface ColumnHeaderOwnerState {
	height: number;
	variant: MatrixColumnVariant;
}
const MatrixColumnHeaderRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "columnHeader",
})<{ ownerState: ColumnHeaderOwnerState }>(({ theme, ownerState }) => ({
	position: "sticky",
	top: 0,
	zIndex: 2,
	height: ownerState.height,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	lineHeight: 1.1,
	...cellBorders(theme),
	...stickyBackground(theme, ownerState.variant),
	...(ownerState.variant === "accent" && {
		boxShadow: `inset 0 -3px 0 ${theme.palette.info.main}`,
	}),
}));

const MatrixColumnHeaderLabel = styled("div", {
	name: "CcMatrixGrid",
	slot: "columnHeaderLabel",
})<{ ownerState: { variant: MatrixColumnVariant } }>(
	({ theme, ownerState }) => ({
		fontWeight: 700,
		fontSize: "0.8rem",
		color: columnHeaderText(theme, ownerState.variant),
	}),
);

const MatrixColumnHeaderSubLabel = styled("div", {
	name: "CcMatrixGrid",
	slot: "columnHeaderSubLabel",
})(({ theme }) => ({
	fontSize: "0.62rem",
	textTransform: "uppercase",
	color: theme.palette.text.secondary,
}));

const MatrixRowHeaderRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "rowHeader",
})<{ ownerState: { height: number; button: boolean } }>(
	({ theme, ownerState }) => ({
		position: "sticky",
		left: 0,
		zIndex: 1,
		height: ownerState.height,
		minWidth: 0,
		overflow: "hidden",
		backgroundColor: theme.palette.background.paper,
		...cellBorders(theme),
		...(ownerState.button && {
			cursor: "pointer",
			WebkitTapHighlightColor: "transparent",
			"&:active": { backgroundColor: theme.palette.action.hover },
		}),
	}),
);

interface BodyCellOwnerState {
	height: number;
	variant: MatrixColumnVariant;
	selected: boolean;
	selectable: boolean;
}
const MatrixBodyCellRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "cell",
})<{ ownerState: BodyCellOwnerState }>(({ theme, ownerState }) => {
	const tint = columnTint(theme, ownerState.variant, false);
	return {
		position: "relative",
		height: ownerState.height,
		...cellBorders(theme),
		backgroundColor: ownerState.selected
			? alpha(
					theme.palette.info.main,
					theme.palette.mode === "dark" ? 0.35 : 0.25,
				)
			: tint,
		...(ownerState.selectable && { cursor: "pointer", userSelect: "none" }),
	};
});

/**
 * The hover hint on a cell that can start a range: a dashed box saying what a
 * click would do.
 */
const MatrixAddAffordance = styled("div", {
	name: "CcMatrixGrid",
	slot: "addAffordance",
})<{ ownerState: { half: boolean } }>(({ theme, ownerState }) => ({
	position: "absolute",
	zIndex: 3,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: theme.shape.borderRadius,
	border: `2px dashed ${theme.palette.success.main}`,
	backgroundColor: alpha(
		theme.palette.success.main,
		theme.palette.mode === "dark" ? 0.2 : 0.12,
	),
	color:
		theme.palette.mode === "dark"
			? theme.palette.success.light
			: theme.palette.success.dark,
	fontSize: "0.8rem",
	fontWeight: 600,
	whiteSpace: "nowrap",
	overflow: "hidden",
	...(ownerState.half
		? {
				// The cell is not blank, it just has nothing of our own in it: claim
				// only the bottom half and CATCH the pointer there, so a press lands
				// on the affordance (starting a range) while the top half still
				// belongs to whatever the cell renders.
				left: 5,
				right: 5,
				bottom: 5,
				height: "calc(50% - 5px)",
				cursor: "pointer",
			}
		: { inset: 5, pointerEvents: "none" }),
}));

const MatrixExtraRowHeader = styled("div", {
	name: "CcMatrixGrid",
	slot: "extraRowHeader",
})<{ ownerState: { height: number } }>(({ theme, ownerState }) => ({
	position: "sticky",
	left: 0,
	zIndex: 1,
	height: ownerState.height,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	gap: 2,
	minWidth: 0,
	overflow: "hidden",
	backgroundColor: theme.palette.background.paper,
	...cellBorders(theme),
}));

const MatrixExtraCell = styled("div", {
	name: "CcMatrixGrid",
	slot: "extraCell",
})<{
	ownerState: {
		height: number;
		variant: MatrixColumnVariant;
		clickable: boolean;
	};
}>(({ theme, ownerState }) => ({
	height: ownerState.height,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: columnTint(theme, ownerState.variant, false),
	...cellBorders(theme),
	...(ownerState.clickable && {
		cursor: "pointer",
		"&:hover": { backgroundColor: theme.palette.action.hover },
		"&:hover .MuiSvgIcon-root": { opacity: 1 },
	}),
}));

const MatrixBadge = styled("div", { name: "CcMatrixGrid", slot: "badge" })(
	({ theme }) => ({
		minWidth: 22,
		height: 22,
		padding: theme.spacing(0, 0.5),
		borderRadius: 11,
		backgroundColor: theme.palette.warning.main,
		color: theme.palette.warning.contrastText,
		fontSize: "0.72rem",
		fontWeight: 700,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	}),
);

const MatrixAddHint = styled(Add, { name: "CcMatrixGrid", slot: "addHint" })(
	({ theme }) => ({
		fontSize: 15,
		opacity: 0,
		color: theme.palette.text.disabled,
	}),
);

// ---- sub components ---------------------------------------------------------

interface MatrixColumnHeaderProps {
	column: MatrixColumn;
	height: number;
	innerRef?: React.Ref<HTMLDivElement>;
	render?: (column: MatrixColumn) => React.ReactNode;
	className?: string;
	labelClassName?: string;
	subLabelClassName?: string;
}

const MatrixColumnHeader = (props: MatrixColumnHeaderProps) => {
	const { column, render } = props;
	const variant = column.variant ?? "normal";
	return (
		<MatrixColumnHeaderRoot
			ref={props.innerRef}
			className={props.className}
			ownerState={{ height: props.height, variant }}
		>
			{render ? (
				render(column)
			) : (
				<>
					<MatrixColumnHeaderLabel
						className={props.labelClassName}
						ownerState={{ variant }}
					>
						{column.label}
					</MatrixColumnHeaderLabel>
					{column.subLabel != null && (
						<MatrixColumnHeaderSubLabel className={props.subLabelClassName}>
							{column.subLabel}
						</MatrixColumnHeaderSubLabel>
					)}
				</>
			)}
		</MatrixColumnHeaderRoot>
	);
};

const MatrixColumnHeaderMemo = React.memo(MatrixColumnHeader);

interface MatrixRowHeaderProps {
	rowKey: string;
	height: number;
	touch: boolean;
	onActions?: (rowKey: string) => void;
	children?: React.ReactNode;
	className?: string;
}

const MatrixRowHeader = (props: MatrixRowHeaderProps) => {
	const { rowKey, touch, onActions } = props;
	const button = touch && !!onActions;
	const handleClick = useCallback(() => {
		onActions?.(rowKey);
	}, [onActions, rowKey]);
	return (
		<MatrixRowHeaderRoot
			className={props.className}
			ownerState={{ height: props.height, button }}
			role={button ? "button" : undefined}
			onClick={button ? handleClick : undefined}
		>
			{props.children}
		</MatrixRowHeaderRoot>
	);
};

const MatrixRowHeaderMemo = React.memo(MatrixRowHeader);

interface MatrixBodyCellProps {
	rowKey: string;
	columnIndex: number;
	columnVariant: MatrixColumnVariant;
	height: number;
	selected: boolean;
	selectable: boolean;
	/** show the hover hint, and as a half-height strip if the cell isn't blank */
	showAdd: boolean;
	addHalf: boolean;
	addLabel?: React.ReactNode;
	onPointerDown?: (rowKey: string, columnIndex: number) => void;
	onPointerEnter?: (rowKey: string, columnIndex: number) => void;
	onPointerLeave?: (rowKey: string, columnIndex: number) => void;
	children?: React.ReactNode;
	className?: string;
	addAffordanceClassName?: string;
}

const MatrixBodyCell = (props: MatrixBodyCellProps) => {
	const { rowKey, columnIndex, onPointerDown, onPointerEnter, onPointerLeave } =
		props;
	const handleMouseDown = useCallback(
		(event: React.MouseEvent) => {
			// no text selection while sweeping a range
			event.preventDefault();
			onPointerDown?.(rowKey, columnIndex);
		},
		[onPointerDown, rowKey, columnIndex],
	);
	const handleMouseEnter = useCallback(() => {
		onPointerEnter?.(rowKey, columnIndex);
	}, [onPointerEnter, rowKey, columnIndex]);
	const handleMouseLeave = useCallback(() => {
		onPointerLeave?.(rowKey, columnIndex);
	}, [onPointerLeave, rowKey, columnIndex]);
	return (
		<MatrixBodyCellRoot
			className={props.className}
			ownerState={{
				height: props.height,
				variant: props.columnVariant,
				selected: props.selected,
				selectable: props.selectable,
			}}
			onMouseDown={onPointerDown ? handleMouseDown : undefined}
			onMouseEnter={onPointerEnter ? handleMouseEnter : undefined}
			onMouseLeave={onPointerLeave ? handleMouseLeave : undefined}
		>
			{props.children}
			{props.showAdd && (
				<MatrixAddAffordance
					className={props.addAffordanceClassName}
					ownerState={{ half: props.addHalf }}
				>
					{props.addLabel}
				</MatrixAddAffordance>
			)}
		</MatrixBodyCellRoot>
	);
};

const MatrixBodyCellMemo = React.memo(MatrixBodyCell);

interface MatrixExtraCellProps {
	columnKey: string;
	columnVariant: MatrixColumnVariant;
	height: number;
	badge?: React.ReactNode;
	onClick?: (columnKey: string) => void;
	className?: string;
	badgeClassName?: string;
	addHintClassName?: string;
}

const MatrixExtraRowCell = (props: MatrixExtraCellProps) => {
	const { columnKey, onClick } = props;
	const handleClick = useCallback(() => {
		onClick?.(columnKey);
	}, [onClick, columnKey]);
	return (
		<MatrixExtraCell
			className={props.className}
			ownerState={{
				height: props.height,
				variant: props.columnVariant,
				clickable: !!onClick,
			}}
			onClick={onClick ? handleClick : undefined}
		>
			{props.badge ? (
				<MatrixBadge className={props.badgeClassName}>
					{props.badge}
				</MatrixBadge>
			) : (
				onClick && <MatrixAddHint className={props.addHintClassName} />
			)}
		</MatrixExtraCell>
	);
};

const MatrixExtraRowCellMemo = React.memo(MatrixExtraRowCell);

// ---- the grid ---------------------------------------------------------------

/** A range being swept, in column indexes (columns keys are opaque strings). */
interface RangeDrag {
	rowKey: string;
	anchor: number;
	focus: number;
}

const inDrag = (drag: RangeDrag | null, rowKey: string, index: number) =>
	!!drag &&
	drag.rowKey === rowKey &&
	index >= Math.min(drag.anchor, drag.focus) &&
	index <= Math.max(drag.anchor, drag.focus);

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
	 * Height of an extra row in px (an extra row can override it)
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
	 */
	selectable?: boolean;
	/**
	 * Which cells a range may start on or run through
	 * @default cells the row has no entry for
	 * @remarks A cell can be selectable AND non-empty: a cell holding only
	 * entries that are none of the consumer's business still accepts a new one.
	 * The hover hint then shrinks to the cell's bottom half.
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
	 */
	onRowHeaderActions?: (rowKey: string) => void;
	/**
	 * Aggregate rows below the data rows: one badge per column, no cells
	 */
	extraRows?: MatrixExtraRow[];
	/**
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<MatrixGridClassKey, string>>;
}

const defaultIsCellSelectable = (cell: unknown) => cell === undefined;
const defaultIsCellOccupied = (cell: unknown) => cell !== undefined;

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
		selectable,
		isCellSelectable = defaultIsCellSelectable,
		isCellOccupied = defaultIsCellOccupied,
		onSelectRange,
		addLabel,
		onRowHeaderActions,
		extraRows,
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

	const [drag, setDrag] = useState<RangeDrag | null>(null);
	const [hover, setHover] = useState<{ rowKey: string; index: number } | null>(
		null,
	);
	const dragging = useRef(false);
	// Mirrors drag, but written synchronously: on a fast click the window
	// mouseup fires in the same tick as the mousedown, before React has
	// flushed setDrag, and the handler must still see the current range.
	const dragRef = useRef<RangeDrag | null>(null);
	const selectRangeRef = useRef(onSelectRange);
	useEffect(() => {
		selectRangeRef.current = onSelectRange;
	}, [onSelectRange]);
	const columnsRef = useRef(columns);
	useEffect(() => {
		columnsRef.current = columns;
	}, [columns]);

	const setRangeDrag = useCallback((next: RangeDrag | null) => {
		dragRef.current = next;
		setDrag(next);
	}, []);

	useEffect(() => {
		if (!selectable) return;
		const onUp = () => {
			if (!dragging.current) return;
			dragging.current = false;
			const current = dragRef.current;
			if (current) {
				const from = Math.min(current.anchor, current.focus);
				const to = Math.max(current.anchor, current.focus);
				const columnKeys = columnsRef.current
					.slice(from, to + 1)
					.map((column) => column.key);
				if (columnKeys.length > 0)
					selectRangeRef.current?.({
						rowKey: current.rowKey,
						fromColumnKey: columnKeys[0],
						toColumnKey: columnKeys[columnKeys.length - 1],
						columnKeys,
					});
			}
			dragRef.current = null;
			setDrag(null);
			setHover(null);
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				dragging.current = false;
				dragRef.current = null;
				setDrag(null);
			}
		};
		window.addEventListener("mouseup", onUp);
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("mouseup", onUp);
			window.removeEventListener("keydown", onKey);
		};
	}, [selectable]);

	const startDrag = useCallback(
		(rowKey: string, index: number) => {
			dragging.current = true;
			setRangeDrag({ rowKey, anchor: index, focus: index });
		},
		[setRangeDrag],
	);
	const extendDrag = useCallback(
		(rowKey: string, index: number) => {
			setHover({ rowKey, index });
			const current = dragRef.current;
			if (dragging.current && current && current.rowKey === rowKey)
				setRangeDrag({ ...current, focus: index });
		},
		[setRangeDrag],
	);
	const leaveCell = useCallback((rowKey: string, index: number) => {
		setHover((previous) =>
			previous?.rowKey === rowKey && previous?.index === index
				? null
				: previous,
		);
	}, []);

	// Scroll the marked column just past the sticky row header column.
	const target =
		scrollToColumn ??
		columns.find((column) => column.variant === "current")?.key;
	useLayoutEffect(() => {
		const scroller = scrollRef.current;
		const cell = scrollTargetRef.current;
		if (scroller && cell)
			scroller.scrollLeft = Math.max(
				0,
				cell.offsetLeft - rowHeaderWidth - columnWidth,
			);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [target, columns.length, columnWidth, rowHeaderWidth]);

	const rowHeaderContext = useMemo<MatrixRowHeaderContext>(
		() => ({ touch }),
		[touch],
	);

	return (
		<MatrixGridScroller
			ref={scrollRef}
			className={combineClassNames([className, classes?.root])}
			ownerState={{ maxHeight }}
		>
			<MatrixGridRoot
				className={classes?.grid}
				ownerState={{ rowHeaderWidth, columns: columns.length, columnWidth }}
			>
				<MatrixCorner
					className={classes?.corner}
					ownerState={{ height: headerHeight }}
				>
					{corner}
				</MatrixCorner>
				{columns.map((column) => (
					<MatrixColumnHeaderMemo
						key={column.key}
						column={column}
						height={headerHeight}
						innerRef={column.key === target ? scrollTargetRef : undefined}
						render={renderColumnHeader}
						className={classes?.columnHeader}
						labelClassName={classes?.columnHeaderLabel}
						subLabelClassName={classes?.columnHeaderSubLabel}
					/>
				))}

				{(extraRows ?? []).map((extraRow) => (
					<React.Fragment key={extraRow.key}>
						<MatrixExtraRowHeader
							className={classes?.extraRowHeader}
							ownerState={{ height: extraRow.height ?? extraRowHeight }}
						>
							{extraRow.header}
						</MatrixExtraRowHeader>
						{columns.map((column) => (
							<MatrixExtraRowCellMemo
								key={column.key}
								columnKey={column.key}
								columnVariant={column.variant ?? "normal"}
								height={extraRow.height ?? extraRowHeight}
								badge={extraRow.badges?.[column.key]}
								onClick={extraRow.onCellClick}
								className={classes?.extraCell}
								badgeClassName={classes?.badge}
								addHintClassName={classes?.addHint}
							/>
						))}
					</React.Fragment>
				))}

				{rows.map((row) => (
					<React.Fragment key={row.key}>
						<MatrixRowHeaderMemo
							rowKey={row.key}
							height={rowHeight}
							touch={touch}
							onActions={onRowHeaderActions}
							className={classes?.rowHeader}
						>
							{renderRowHeader(row, rowHeaderContext)}
						</MatrixRowHeaderMemo>
						{columns.map((column, columnIndex) => {
							const cell = row.cells[column.key];
							const selected = inDrag(drag, row.key, columnIndex);
							const context: MatrixCellContext<TCell> = {
								row,
								column,
								columnIndex,
								selected,
							};
							const cellSelectable =
								!!selectable &&
								row.selectable !== false &&
								isCellSelectable(cell, context);
							const occupied = isCellOccupied(cell, context);
							const content = renderCell(cell, context);
							return (
								<MatrixBodyCellMemo
									key={column.key}
									rowKey={row.key}
									columnIndex={columnIndex}
									columnVariant={column.variant ?? "normal"}
									height={rowHeight}
									selected={selected}
									selectable={cellSelectable}
									showAdd={
										cellSelectable &&
										!touch &&
										hover?.rowKey === row.key &&
										hover?.index === columnIndex &&
										!dragging.current
									}
									addHalf={occupied}
									addLabel={addLabel}
									onPointerDown={cellSelectable ? startDrag : undefined}
									onPointerEnter={cellSelectable ? extendDrag : undefined}
									onPointerLeave={cellSelectable ? leaveCell : undefined}
									className={classes?.cell}
									addAffordanceClassName={classes?.addAffordance}
								>
									{renderCellWrapper
										? renderCellWrapper(content, context)
										: content}
								</MatrixBodyCellMemo>
							);
						})}
					</React.Fragment>
				))}
			</MatrixGridRoot>
		</MatrixGridScroller>
	);
};

// React.memo drops the generic parameter (its typing collapses TCell to
// unknown), so the memoized component is cast back to the generic signature.
// Behaviour is unchanged, only the type survives.
export default React.memo(MatrixGrid) as typeof MatrixGrid;
