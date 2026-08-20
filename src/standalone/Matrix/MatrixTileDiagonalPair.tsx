import React, { useCallback, useMemo } from "react";
import { styled, Tooltip } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import {
	contrastTextFor,
	dimColor,
	MATRIX_TILE_DIM_OPACITY,
} from "./matrixTileDim";
import { useMatrixCellTileProps } from "./MatrixCellTileContext";
import MatrixTileCorners from "./MatrixTileCorners";
import useMatrixActivation from "./useMatrixActivation";
import { MatrixTileCorner, MatrixTileItem } from "./types";

export const MatrixTileDiagonalRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "diagonal",
})(({ theme }) => ({
	position: "relative",
	width: "100%",
	height: "100%",
	borderRadius: theme.shape.borderRadius,
	overflow: "hidden",
	background: `linear-gradient(to bottom right, ${cssVar(
		matrixVars.tileBackgroundA,
	)} 0 49.5%, ${cssVar(matrixVars.tileBackgroundB)} 50.5% 100%)`,
	[`&.${matrixClasses.itemClickable}`]: {
		cursor: "pointer",
		"&:focus-visible": {
			outline: `2px solid ${theme.palette.primary.main}`,
			outlineOffset: -2,
		},
	},
}));

export const MatrixTileDiagonalLabel = styled("div", {
	name: "CcMatrixCellTile",
	slot: "diagonalLabel",
})({
	position: "absolute",
	fontWeight: 700,
	fontSize: 11,
	lineHeight: 1.2,
	[`&.${matrixClasses.diagonalLabelStart}`]: {
		top: 0,
		left: 3,
		color: cssVar(matrixVars.tileForegroundA),
	},
	[`&.${matrixClasses.diagonalLabelEnd}`]: {
		bottom: 0,
		right: 3,
		color: cssVar(matrixVars.tileForegroundB),
	},
	[`&.${matrixClasses.diagonalLabelDimmed}`]: {
		opacity: MATRIX_TILE_DIM_OPACITY,
	},
});

/** The only corner a diagonal pair draws — the others would land on a label. */
const DIAGONAL_CORNERS: MatrixTileCorner[] = ["bottomLeft"];

export interface MatrixTileDiagonalPairProps {
	/**
	 * The entry drawn in the upper left half
	 */
	a: MatrixTileItem;
	/**
	 * The entry drawn in the lower right half
	 */
	b: MatrixTileItem;
}

/**
 * Two entries as one diagonally cut box: space-saving, but one click target and
 * one drag handle, and only label plus fill color of each entry survive (see
 * MatrixCellTileProps.pairLayout).
 */
const MatrixTileDiagonalPair = (props: MatrixTileDiagonalPairProps) => {
	const { a, b } = props;
	const { onItemClick, classes } = useMatrixCellTileProps();
	const activate = useCallback(() => {
		onItemClick?.(a);
	}, [onItemClick, a]);
	const activation = useMatrixActivation(onItemClick ? activate : undefined);
	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);
	const style = useMemo(
		() =>
			({
				[matrixVars.tileBackgroundA]: a.dimmed
					? dimColor(a.backgroundColor)
					: a.backgroundColor,
				[matrixVars.tileBackgroundB]: b.dimmed
					? dimColor(b.backgroundColor)
					: b.backgroundColor,
				[matrixVars.tileForegroundA]:
					a.textColor ?? contrastTextFor(a.backgroundColor),
				[matrixVars.tileForegroundB]:
					b.textColor ?? contrastTextFor(b.backgroundColor),
			}) as React.CSSProperties,
		[
			a.dimmed,
			a.backgroundColor,
			a.textColor,
			b.dimmed,
			b.backgroundColor,
			b.textColor,
		],
	);
	const tooltip = [a.tooltip, b.tooltip].filter((e) => !!e).join(" / ");

	const pair = (
		<MatrixTileDiagonalRoot
			className={combineClassNames([
				classes?.diagonal,
				onItemClick && matrixClasses.itemClickable,
			])}
			style={style}
			{...activation}
			onMouseDown={onItemClick ? handleMouseDown : undefined}
		>
			<MatrixTileDiagonalLabel
				className={combineClassNames([
					classes?.diagonalLabel,
					matrixClasses.diagonalLabelStart,
					a.dimmed && matrixClasses.diagonalLabelDimmed,
				])}
			>
				{a.label}
			</MatrixTileDiagonalLabel>
			<MatrixTileDiagonalLabel
				className={combineClassNames([
					classes?.diagonalLabel,
					matrixClasses.diagonalLabelEnd,
					b.dimmed && matrixClasses.diagonalLabelDimmed,
				])}
			>
				{b.label}
			</MatrixTileDiagonalLabel>
			{/* only this corner: the other three would land on top of a label */}
			<MatrixTileCorners
				item={a}
				only={DIAGONAL_CORNERS}
				className={classes?.corner}
			/>
		</MatrixTileDiagonalRoot>
	);

	return tooltip ? (
		<Tooltip title={tooltip} enterDelay={400}>
			{pair}
		</Tooltip>
	) : (
		pair
	);
};

export default React.memo(MatrixTileDiagonalPair);
