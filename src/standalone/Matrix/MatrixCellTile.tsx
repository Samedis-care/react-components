import React from "react";
import { alpha, styled, Tooltip, useThemeProps } from "@mui/material";
import { ArrowDownward, ArrowRightAlt } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import { MatrixTileCorner, MatrixTileItem } from "./types";

/**
 * How strongly a dimmed entry is faded.
 * @remarks Keep MATRIX_TILE_DIM_ALPHA_HEX below in sync when changing this: one
 * half of a diagonal pair cannot use opacity (that would fade both halves), so
 * it dims its gradient color with the hex-alpha twin instead.
 */
export const MATRIX_TILE_DIM_OPACITY = 0.6;
const MATRIX_TILE_DIM_ALPHA_HEX = "99"; // 0.6 * 255 = 153 = 0x99

export type MatrixCellTileClassKey =
	| "root"
	| "item"
	| "itemContent"
	| "highlight"
	| "diagonal"
	| "diagonalLabel"
	| "placeholder"
	| "corner";

interface MatrixCellTileRootOwnerState {
	direction: "row" | "column";
}
const MatrixCellTileRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "root",
})<{ ownerState: MatrixCellTileRootOwnerState }>(({ ownerState }) => ({
	boxSizing: "border-box",
	width: "100%",
	height: "100%",
	padding: 2,
	display: "flex",
	flexDirection: ownerState.direction,
	gap: 2,
}));

interface MatrixTileItemOwnerState {
	backgroundColor: string;
	textColor?: string;
	dimmed: boolean;
	clickable: boolean;
}
const MatrixTileItemRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "item",
})<{ ownerState: MatrixTileItemOwnerState }>(({ theme, ownerState }) => ({
	position: "relative",
	width: "100%",
	height: "100%",
	minWidth: 0,
	minHeight: 0,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	overflow: "hidden",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: ownerState.backgroundColor,
	color: ownerState.textColor,
	cursor: ownerState.clickable ? "pointer" : undefined,
	// informational entry: same area, faded, instead of stealing space
	opacity: ownerState.dimmed ? MATRIX_TILE_DIM_OPACITY : 1,
}));

interface MatrixTileItemContentOwnerState {
	flow: "horizontal" | "vertical";
	fontSize: number;
}
const MatrixTileItemContent = styled("div", {
	name: "CcMatrixCellTile",
	slot: "itemContent",
})<{ ownerState: MatrixTileItemContentOwnerState }>(({ ownerState }) => ({
	display: "flex",
	flexDirection: ownerState.flow === "horizontal" ? "row" : "column",
	alignItems: "center",
	justifyContent: "center",
	gap: ownerState.flow === "horizontal" ? 2 : 0,
	fontWeight: 700,
	fontSize: ownerState.fontSize,
	lineHeight: 1,
	minWidth: 0,
}));

const MatrixTileCornerRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "corner",
})<{ ownerState: { corner: MatrixTileCorner } }>(({ ownerState }) => ({
	position: "absolute",
	display: "flex",
	alignItems: "center",
	...(ownerState.corner === "topLeft" && { top: 1, left: 1 }),
	...(ownerState.corner === "topRight" && { top: 1, right: 1 }),
	...(ownerState.corner === "bottomLeft" && { bottom: 1, left: 1 }),
	...(ownerState.corner === "bottomRight" && { bottom: 1, right: 1 }),
}));

/**
 * The attention ring around a highlighted entry.
 * @remarks A STATIC ring on purpose: an infinite CSS animation keeps the
 * compositor awake and drains battery on tablets as long as the grid is open.
 * A solid ring highlights just as clearly at zero cost.
 */
const MatrixTileHighlight = styled("div", {
	name: "CcMatrixCellTile",
	slot: "highlight",
})(({ theme }) => ({
	width: "100%",
	height: "100%",
	borderRadius: theme.shape.borderRadius,
	boxShadow: `0 0 0 3px ${theme.palette.warning.main}, 0 0 6px 1px ${alpha(
		theme.palette.warning.main,
		0.5,
	)}`,
}));

interface MatrixTileDiagonalOwnerState {
	colorA: string;
	colorB: string;
	clickable: boolean;
}
const MatrixTileDiagonalRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "diagonal",
})<{ ownerState: MatrixTileDiagonalOwnerState }>(({ theme, ownerState }) => ({
	position: "relative",
	width: "100%",
	height: "100%",
	borderRadius: theme.shape.borderRadius,
	overflow: "hidden",
	cursor: ownerState.clickable ? "pointer" : undefined,
	background: `linear-gradient(to bottom right, ${ownerState.colorA} 0 49.5%, ${ownerState.colorB} 50.5% 100%)`,
}));

const MatrixTileDiagonalLabel = styled("div", {
	name: "CcMatrixCellTile",
	slot: "diagonalLabel",
})<{
	ownerState: { position: "start" | "end"; color?: string; faded: boolean };
}>(({ ownerState }) => ({
	position: "absolute",
	fontWeight: 700,
	fontSize: 11,
	lineHeight: 1.2,
	color: ownerState.color,
	opacity: ownerState.faded ? MATRIX_TILE_DIM_OPACITY : 1,
	...(ownerState.position === "start" ? { top: 0, left: 3 } : {}),
	...(ownerState.position === "end" ? { bottom: 0, right: 3 } : {}),
}));

const MatrixTilePlaceholder = styled("div", {
	name: "CcMatrixCellTile",
	slot: "placeholder",
})(({ theme }) => ({
	width: "100%",
	height: "100%",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: theme.palette.action.hover,
	display: "flex",
	alignItems: "flex-end",
	padding: 2,
	boxSizing: "border-box",
}));

/**
 * Font size for a short code: the shorter it is, the bigger it can be. Only a
 * plain string can be measured this way — a ReactNode label keeps the default.
 */
const labelFontSize = (label: React.ReactNode): number => {
	if (typeof label !== "string") return 14;
	return label.length <= 2 ? 14 : label.length === 3 ? 12 : 10;
};

/** Alpha-dimmed version of a 6-digit hex color, other formats pass through. */
const dimColor = (color: string): string =>
	/^#[0-9a-fA-F]{6}$/.test(color)
		? `${color}${MATRIX_TILE_DIM_ALPHA_HEX}`
		: color;

const renderCorners = (item: MatrixTileItem, className?: string) =>
	item.corners &&
	(Object.keys(item.corners) as MatrixTileCorner[]).map((corner) =>
		item.corners?.[corner] ? (
			<MatrixTileCornerRoot
				key={corner}
				className={className}
				ownerState={{ corner }}
			>
				{item.corners[corner]}
			</MatrixTileCornerRoot>
		) : null,
	);

interface MatrixTileItemViewProps {
	item: MatrixTileItem;
	onClick?: (item: MatrixTileItem) => void;
	className?: string;
	contentClassName?: string;
	cornerClassName?: string;
}

const MatrixTileItemView = (props: MatrixTileItemViewProps) => {
	const { item, onClick } = props;
	const handleClick = React.useCallback(() => {
		onClick?.(item);
	}, [onClick, item]);
	// A clickable entry must not also start a range selection in the grid
	// below it: without this, pressing an entry would both open it and begin
	// dragging a new range.
	const handleMouseDown = React.useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);
	return (
		<Tooltip title={item.tooltip ?? ""} enterDelay={400}>
			<MatrixTileItemRoot
				className={props.className}
				ownerState={{
					backgroundColor: item.backgroundColor,
					textColor: item.textColor,
					dimmed: !!item.dimmed,
					clickable: !!onClick,
				}}
				onClick={onClick ? handleClick : undefined}
				onMouseDown={onClick ? handleMouseDown : undefined}
			>
				<MatrixTileItemContent
					className={props.contentClassName}
					ownerState={{
						flow: item.flow ?? "vertical",
						fontSize: labelFontSize(item.label),
					}}
				>
					<span>{item.label}</span>
					{item.secondaryLabel != null && (
						<>
							{(item.flow ?? "vertical") === "horizontal" ? (
								<ArrowRightAlt sx={{ fontSize: 16 }} />
							) : (
								<ArrowDownward sx={{ fontSize: 13 }} />
							)}
							<span style={{ fontSize: labelFontSize(item.secondaryLabel) }}>
								{item.secondaryLabel}
							</span>
						</>
					)}
				</MatrixTileItemContent>
				{renderCorners(item, props.cornerClassName)}
			</MatrixTileItemRoot>
		</Tooltip>
	);
};

const MatrixTileItemViewMemo = React.memo(MatrixTileItemView);

interface MatrixTileDiagonalPairProps {
	a: MatrixTileItem;
	b: MatrixTileItem;
	onClick?: (item: MatrixTileItem) => void;
	className?: string;
	labelClassName?: string;
	cornerClassName?: string;
}

const MatrixTileDiagonalPair = (props: MatrixTileDiagonalPairProps) => {
	const { a, b, onClick } = props;
	const handleClick = React.useCallback(() => {
		onClick?.(a);
	}, [onClick, a]);
	const handleMouseDown = React.useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);
	return (
		<Tooltip
			title={[a.tooltip, b.tooltip].filter((e) => !!e).join(" / ")}
			enterDelay={400}
		>
			<MatrixTileDiagonalRoot
				className={props.className}
				ownerState={{
					colorA: a.dimmed ? dimColor(a.backgroundColor) : a.backgroundColor,
					colorB: b.dimmed ? dimColor(b.backgroundColor) : b.backgroundColor,
					clickable: !!onClick,
				}}
				onClick={onClick ? handleClick : undefined}
				onMouseDown={onClick ? handleMouseDown : undefined}
			>
				<MatrixTileDiagonalLabel
					className={props.labelClassName}
					ownerState={{
						position: "start",
						color: a.textColor,
						faded: !!a.dimmed,
					}}
				>
					{a.label}
				</MatrixTileDiagonalLabel>
				<MatrixTileDiagonalLabel
					className={props.labelClassName}
					ownerState={{
						position: "end",
						color: b.textColor,
						faded: !!b.dimmed,
					}}
				>
					{b.label}
				</MatrixTileDiagonalLabel>
				{renderCorners(a, props.cornerClassName)}
			</MatrixTileDiagonalRoot>
		</Tooltip>
	);
};

const MatrixTileDiagonalPairMemo = React.memo(MatrixTileDiagonalPair);

export interface MatrixCellTileProps {
	/**
	 * The entries in this cell. At most two are rendered — a cell is too small
	 * for more, and the third entry would be unreadable.
	 */
	items: MatrixTileItem[];
	/**
	 * How two entries share the cell: side by side (split) or as a diagonally
	 * cut single box (diagonal, saves space but is read-only-ish: the pair is
	 * one click target and one drag handle)
	 * @default "split"
	 */
	pairLayout?: "split" | "diagonal";
	/**
	 * Which way a split pair is stacked
	 * @default "row"
	 */
	splitDirection?: "row" | "column";
	/**
	 * Rendered when there are no entries at all. Use it to say something about
	 * the cell itself (an absence, a closed day) — it sits on a muted panel.
	 */
	placeholder?: React.ReactNode;
	/**
	 * Called with the clicked entry. In the diagonal layout the pair reports
	 * the first entry, since the halves are not separate targets.
	 */
	onItemClick?: (item: MatrixTileItem) => void;
	/**
	 * Wraps every rendered entry, so each one can become a drag handle without
	 * this component knowing anything about drag & drop. Not called for a
	 * diagonal pair — those two halves are one box.
	 */
	renderItem?: (item: MatrixTileItem, node: React.ReactNode) => React.ReactNode;
	/**
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<MatrixCellTileClassKey, string>>;
}

const MatrixCellTile = (inProps: MatrixCellTileProps) => {
	const props = useThemeProps({ props: inProps, name: "CcMatrixCellTile" });
	const {
		items,
		pairLayout = "split",
		splitDirection = "row",
		placeholder,
		onItemClick,
		renderItem,
		className,
		classes,
	} = props;

	const highlight = React.useCallback(
		(item: MatrixTileItem, node: React.ReactNode) =>
			item.highlighted ? (
				<MatrixTileHighlight className={classes?.highlight}>
					{node}
				</MatrixTileHighlight>
			) : (
				node
			),
		[classes?.highlight],
	);
	const wrap = React.useCallback(
		(item: MatrixTileItem, node: React.ReactNode) => {
			const highlighted = highlight(item, node);
			return renderItem ? renderItem(item, highlighted) : highlighted;
		},
		[highlight, renderItem],
	);

	const root = (children: React.ReactNode) => (
		<MatrixCellTileRoot
			className={combineClassNames([className, classes?.root])}
			ownerState={{ direction: splitDirection }}
		>
			{children}
		</MatrixCellTileRoot>
	);

	if (items.length === 0)
		return root(
			placeholder ? (
				<MatrixTilePlaceholder className={classes?.placeholder}>
					{placeholder}
				</MatrixTilePlaceholder>
			) : null,
		);

	if (items.length === 1 || pairLayout === "split")
		return root(
			items
				.slice(0, 2)
				.map((item) => (
					<React.Fragment key={item.key}>
						{wrap(
							item,
							<MatrixTileItemViewMemo
								item={item}
								onClick={onItemClick}
								className={classes?.item}
								contentClassName={classes?.itemContent}
								cornerClassName={classes?.corner}
							/>,
						)}
					</React.Fragment>
				)),
		);

	const pair = (
		<MatrixTileDiagonalPairMemo
			a={items[0]}
			b={items[1]}
			onClick={onItemClick}
			className={classes?.diagonal}
			labelClassName={classes?.diagonalLabel}
			cornerClassName={classes?.corner}
		/>
	);
	return root(
		items[0].highlighted || items[1].highlighted ? (
			<MatrixTileHighlight className={classes?.highlight}>
				{pair}
			</MatrixTileHighlight>
		) : (
			pair
		),
	);
};

export default React.memo(MatrixCellTile);
