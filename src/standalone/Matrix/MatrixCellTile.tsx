import React, { useMemo } from "react";
import { alpha, styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { matrixClasses } from "./matrixClasses";
import {
	MatrixCellTileContextValue,
	MatrixCellTileProps,
	MatrixCellTilePropsContext,
} from "./MatrixCellTileContext";
import MatrixTileItem from "./MatrixTileItem";
import MatrixTileDiagonalPair from "./MatrixTileDiagonalPair";
import { MatrixTileItem as MatrixTileItemData } from "./types";

export const MatrixCellTileRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "root",
})({
	boxSizing: "border-box",
	width: "100%",
	height: "100%",
	padding: 2,
	display: "flex",
	flexDirection: "row",
	gap: 2,
	[`&.${matrixClasses.directionColumn}`]: { flexDirection: "column" },
});

/**
 * The attention ring around a highlighted entry.
 * @remarks A STATIC ring on purpose: an infinite CSS animation keeps the
 * compositor awake and drains battery on tablets as long as the grid is open.
 * A solid ring highlights just as clearly at zero cost.
 */
export const MatrixTileHighlight = styled("div", {
	name: "CcMatrixCellTile",
	slot: "highlight",
})(({ theme }) => ({
	width: "100%",
	height: "100%",
	borderRadius: theme.shape.borderRadius,
	// alpha(), not a hex-alpha suffix: the palette value can be rgb(), hsl() or
	// a CSS variable, and appending to those invalidates the whole declaration
	// — which would drop the ring entirely instead of just its glow.
	boxShadow: `0 0 0 3px ${theme.palette.warning.main}, 0 0 6px 1px ${alpha(
		theme.palette.warning.main,
		0.5,
	)}`,
}));

export const MatrixTilePlaceholder = styled("div", {
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

	// A plain function on purpose: this is called while rendering, never passed
	// to a memoized child, so a useCallback around it would buy nothing.
	const wrap = (item: MatrixTileItemData, node: React.ReactNode) => {
		const highlighted = item.highlighted ? (
			<MatrixTileHighlight className={classes?.highlight}>
				{node}
			</MatrixTileHighlight>
		) : (
			node
		);
		return renderItem ? renderItem(item, highlighted) : highlighted;
	};

	let content: React.ReactNode = null;
	if (items.length === 0) {
		// != null, not truthiness: 0 is a placeholder a consumer may well pass
		content =
			placeholder != null ? (
				<MatrixTilePlaceholder className={classes?.placeholder}>
					{placeholder}
				</MatrixTilePlaceholder>
			) : null;
	} else if (items.length === 1 || pairLayout === "split") {
		content = items
			.slice(0, 2)
			.map((item) => (
				<React.Fragment key={item.key}>
					{wrap(item, <MatrixTileItem item={item} />)}
				</React.Fragment>
			));
	} else {
		const pair = <MatrixTileDiagonalPair a={items[0]} b={items[1]} />;
		content =
			items[0].highlighted || items[1].highlighted ? (
				<MatrixTileHighlight className={classes?.highlight}>
					{pair}
				</MatrixTileHighlight>
			) : (
				pair
			);
	}

	// Only what an entry reads, so a consumer mapping its items fresh on every
	// render (the normal case) does not invalidate this and re-render them.
	const context = useMemo<MatrixCellTileContextValue>(
		() => ({ onItemClick, classes }),
		[onItemClick, classes],
	);

	return (
		<MatrixCellTilePropsContext.Provider value={context}>
			<MatrixCellTileRoot
				className={combineClassNames([
					className,
					classes?.root,
					splitDirection === "column" && matrixClasses.directionColumn,
				])}
			>
				{content}
			</MatrixCellTileRoot>
		</MatrixCellTilePropsContext.Provider>
	);
};

export default React.memo(MatrixCellTile);
