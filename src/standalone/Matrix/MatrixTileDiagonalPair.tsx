import React, { useCallback, useMemo } from "react";
import { styled, Tooltip, useTheme } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { tileColors } from "./matrixTileDim";
import { useMatrixCellTileProps } from "./MatrixCellTileContext";
import { entryFocusRing } from "./matrixTints";
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
		"&:focus-visible": entryFocusRing(theme),
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
 * one drag handle (MatrixCellTile passes it to renderItem as the first entry),
 * and of each entry only the label, the colors and the tooltip survive, plus
 * the first entry's bottomLeft corner (see MatrixCellTileProps.pairLayout).
 */
const MatrixTileDiagonalPair = (props: MatrixTileDiagonalPairProps) => {
	const { a, b } = props;
	const { onItemClick, classes } = useMatrixCellTileProps();
	const theme = useTheme();
	const activate = useCallback(() => {
		onItemClick?.(a);
	}, [onItemClick, a]);
	const activation = useMatrixActivation(onItemClick ? activate : undefined);
	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);
	// a dimmed half fades its fill, not its label, as a dimmed entry does
	const style = useMemo(() => {
		const colorsA = tileColors(theme, a.backgroundColor, a.textColor, a.dimmed);
		const colorsB = tileColors(theme, b.backgroundColor, b.textColor, b.dimmed);
		return {
			[matrixVars.tileBackgroundA]: colorsA.fill,
			[matrixVars.tileBackgroundB]: colorsB.fill,
			[matrixVars.tileForegroundA]: colorsA.label,
			[matrixVars.tileForegroundB]: colorsB.label,
		} as React.CSSProperties;
	}, [
		theme,
		a.dimmed,
		a.backgroundColor,
		a.textColor,
		b.dimmed,
		b.backgroundColor,
		b.textColor,
	]);
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

	// describeChild: both tooltips describe the pair, named by both labels
	// (see MatrixTileItem)
	return tooltip ? (
		<Tooltip title={tooltip} enterDelay={400} describeChild>
			{pair}
		</Tooltip>
	) : (
		pair
	);
};

export default React.memo(MatrixTileDiagonalPair);
