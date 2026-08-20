import React, { useCallback, useMemo } from "react";
import { styled, Tooltip } from "@mui/material";
import { ArrowDownward, ArrowRightAlt } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { MATRIX_TILE_DIM_OPACITY } from "./matrixTileDim";
import { useMatrixCellTileProps } from "./MatrixCellTileContext";
import MatrixTileCorners from "./MatrixTileCorners";
import { MatrixTileItem as MatrixTileItemData } from "./types";

export const MatrixTileItemRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "item",
})(({ theme }) => ({
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
	backgroundColor: cssVar(matrixVars.tileBackground),
	color: cssVar(matrixVars.tileForeground),
	// informational entry: same area, faded, instead of stealing space
	[`&.${matrixClasses.itemDimmed}`]: { opacity: MATRIX_TILE_DIM_OPACITY },
	[`&.${matrixClasses.itemClickable}`]: { cursor: "pointer" },
}));

export const MatrixTileItemContent = styled("div", {
	name: "CcMatrixCellTile",
	slot: "itemContent",
})({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	fontWeight: 700,
	lineHeight: 1,
	minWidth: 0,
	fontSize: cssVar(matrixVars.tileFontSize),
	[`&.${matrixClasses.flowHorizontal}`]: {
		flexDirection: "row",
		gap: 2,
	},
	"& > .CcMatrixCellTile-secondaryLabel": {
		fontSize: cssVar(matrixVars.tileSecondaryFontSize),
	},
});

const FlowArrowVertical = styled(ArrowDownward)({ fontSize: 13 });
const FlowArrowHorizontal = styled(ArrowRightAlt)({ fontSize: 16 });

/**
 * Font size for a short code: the shorter it is, the bigger it can be. Only a
 * plain string can be measured this way — a ReactNode label keeps the default.
 */
export const labelFontSize = (label: React.ReactNode): number => {
	if (typeof label !== "string") return 14;
	return label.length <= 2 ? 14 : label.length === 3 ? 12 : 10;
};

export interface MatrixTileItemProps {
	/**
	 * The entry to draw
	 */
	item: MatrixTileItemData;
}

const MatrixTileItem = (props: MatrixTileItemProps) => {
	const { item } = props;
	const { onItemClick, classes } = useMatrixCellTileProps();
	const handleClick = useCallback(() => {
		onItemClick?.(item);
	}, [onItemClick, item]);
	// A clickable entry must not also start a range selection in the grid
	// below it: without this, pressing an entry would both open it and begin
	// dragging a new range.
	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);
	const horizontal = (item.flow ?? "vertical") === "horizontal";
	const style = useMemo(
		() =>
			({
				[matrixVars.tileBackground]: item.backgroundColor,
				[matrixVars.tileForeground]: item.textColor,
				[matrixVars.tileFontSize]: `${labelFontSize(item.label)}px`,
				[matrixVars.tileSecondaryFontSize]: `${labelFontSize(
					item.secondaryLabel,
				)}px`,
			}) as React.CSSProperties,
		[item.backgroundColor, item.textColor, item.label, item.secondaryLabel],
	);

	const entry = (
		<MatrixTileItemRoot
			className={combineClassNames([
				classes?.item,
				item.dimmed && matrixClasses.itemDimmed,
				onItemClick && matrixClasses.itemClickable,
			])}
			style={style}
			onClick={onItemClick ? handleClick : undefined}
			onMouseDown={onItemClick ? handleMouseDown : undefined}
		>
			<MatrixTileItemContent
				className={combineClassNames([
					classes?.itemContent,
					horizontal && matrixClasses.flowHorizontal,
				])}
			>
				<span>{item.label}</span>
				{item.secondaryLabel != null && (
					<>
						{horizontal ? <FlowArrowHorizontal /> : <FlowArrowVertical />}
						<span className={"CcMatrixCellTile-secondaryLabel"}>
							{item.secondaryLabel}
						</span>
					</>
				)}
			</MatrixTileItemContent>
			<MatrixTileCorners item={item} className={classes?.corner} />
		</MatrixTileItemRoot>
	);

	// No tooltip, no Tooltip: one per cell entry adds up over a whole grid.
	return item.tooltip ? (
		<Tooltip title={item.tooltip} enterDelay={400}>
			{entry}
		</Tooltip>
	) : (
		entry
	);
};

export default React.memo(MatrixTileItem);
