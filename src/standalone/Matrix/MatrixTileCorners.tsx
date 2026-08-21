import React from "react";
import { styled } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { matrixClasses } from "./matrixClasses";
import { MatrixTileCorner, MatrixTileItem } from "./types";

export const MatrixTileCornerRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "corner",
})({
	position: "absolute",
	display: "flex",
	alignItems: "center",
	[`&.${matrixClasses.cornerTopLeft}`]: { top: 1, left: 1 },
	[`&.${matrixClasses.cornerTopRight}`]: { top: 1, right: 1 },
	[`&.${matrixClasses.cornerBottomLeft}`]: { bottom: 1, left: 1 },
	[`&.${matrixClasses.cornerBottomRight}`]: { bottom: 1, right: 1 },
});

const CORNER_CLASS: Record<MatrixTileCorner, string> = {
	topLeft: matrixClasses.cornerTopLeft,
	topRight: matrixClasses.cornerTopRight,
	bottomLeft: matrixClasses.cornerBottomLeft,
	bottomRight: matrixClasses.cornerBottomRight,
};

const ALL_CORNERS: MatrixTileCorner[] = [
	"topLeft",
	"topRight",
	"bottomLeft",
	"bottomRight",
];

export interface MatrixTileCornersProps {
	/**
	 * The entry whose corners are drawn
	 */
	item: MatrixTileItem;
	/**
	 * Which corners to draw
	 * @default all four
	 */
	only?: MatrixTileCorner[];
	/**
	 * Custom class for every corner
	 */
	className?: string;
}

const MatrixTileCorners = (props: MatrixTileCornersProps) => {
	const { corners } = props.item;
	if (!corners) return null;
	return (
		<>
			{(props.only ?? ALL_CORNERS).map((corner) =>
				corners[corner] ? (
					<MatrixTileCornerRoot
						key={corner}
						className={combineClassNames([
							props.className,
							CORNER_CLASS[corner],
						])}
					>
						{corners[corner]}
					</MatrixTileCornerRoot>
				) : null,
			)}
		</>
	);
};

export default React.memo(MatrixTileCorners);
