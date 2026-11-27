import React, { useCallback, useMemo } from "react";
import { styled, Tooltip, useTheme } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { tileColors } from "./matrixTileDim";
import { useMatrixCellTileProps } from "./MatrixCellTileContext";
import { entryFocusRing } from "./matrixTints";
import MatrixTileCorners from "./MatrixTileCorners";
import MatrixTileFlowArrow from "./MatrixTileFlowArrow";
import MatrixTileStateText from "./MatrixTileStateText";
import useMatrixActivation from "./useMatrixActivation";
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
	// a dimmed entry fades its fill only (tileColors): opacity on the entry
	// would fade its label, its corners and its focus ring with it
	[`&.${matrixClasses.itemClickable}`]: {
		cursor: "pointer",
		"&:focus-visible": entryFocusRing(theme),
	},
	// Forced colors paint every fill in the canvas color: a border keeps the
	// entries apart, dashed where the fade would have set one apart
	"@media (forced-colors: active)": {
		boxSizing: "border-box",
		border: "1px solid CanvasText",
		[`&.${matrixClasses.itemDimmed}`]: { borderStyle: "dashed" },
	},
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

/**
 * Font size for a short code: the shorter it is, the bigger it can be. Only a
 * plain string or a number can be measured this way — a number counts as the
 * digits React writes for it, so 1234 is sized like "1234". Any other
 * ReactNode keeps the default.
 * @param label The label to size
 * @returns The font size in px: 14 up to two characters, 12 for three, 10
 * for more
 */
export const labelFontSize = (label: React.ReactNode): number => {
	const text =
		typeof label === "number" || typeof label === "bigint"
			? String(label)
			: label;
	if (typeof text !== "string") return 14;
	return text.length <= 2 ? 14 : text.length === 3 ? 12 : 10;
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
	const theme = useTheme();
	const activate = useCallback(() => {
		onItemClick?.(item);
	}, [onItemClick, item]);
	// An entry one can click has to be one a keyboard can reach too. The name
	// comes from the label it renders, with the arrow and the state in words
	// (visually hidden); the tooltip is its description. Its
	// role is also what keeps a press on it from starting a range in the grid
	// below (the cell skips presses inside [role=button]), so the press still
	// reaches the consumer's renderItem and renderCellWrapper wrappers.
	const activation = useMatrixActivation(onItemClick ? activate : undefined);
	const horizontal = (item.flow ?? "vertical") === "horizontal";
	const style = useMemo(() => {
		const colors = tileColors(
			theme,
			item.backgroundColor,
			item.textColor,
			item.dimmed,
		);
		return {
			[matrixVars.tileBackground]: colors.fill,
			[matrixVars.tileForeground]: colors.label,
			[matrixVars.tileFontSize]: `${labelFontSize(item.label)}px`,
			// never above the primary label: the arrow points AT this, it is
			// not the headline (see MatrixTileItem.secondaryLabel)
			[matrixVars.tileSecondaryFontSize]: `${Math.min(
				labelFontSize(item.label),
				labelFontSize(item.secondaryLabel),
			)}px`,
		} as React.CSSProperties;
	}, [
		theme,
		item.backgroundColor,
		item.textColor,
		item.dimmed,
		item.label,
		item.secondaryLabel,
	]);

	const entry = (
		<MatrixTileItemRoot
			className={combineClassNames([
				classes?.item,
				item.dimmed && matrixClasses.itemDimmed,
				onItemClick && matrixClasses.itemClickable,
			])}
			style={style}
			{...activation}
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
						<MatrixTileFlowArrow horizontal={horizontal} />
						<span className={"CcMatrixCellTile-secondaryLabel"}>
							{item.secondaryLabel}
						</span>
					</>
				)}
				{(item.highlighted || item.dimmed) && (
					<MatrixTileStateText
						highlighted={item.highlighted}
						dimmed={item.dimmed}
					/>
				)}
			</MatrixTileItemContent>
			<MatrixTileCorners item={item} className={classes?.corner} />
		</MatrixTileItemRoot>
	);

	// No tooltip, no Tooltip: one per cell entry adds up over a whole grid.
	// describeChild: the tooltip describes the entry instead of naming it, so
	// the label stays the name, and a read-only entry (a div without a role)
	// gets no aria-label, which a role-less element cannot carry.
	return item.tooltip ? (
		<Tooltip title={item.tooltip} enterDelay={400} describeChild>
			{entry}
		</Tooltip>
	) : (
		entry
	);
};

export default React.memo(MatrixTileItem);
