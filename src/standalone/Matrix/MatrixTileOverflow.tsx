import React, { useMemo } from "react";
import { styled, Tooltip, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import ccI18n from "../../i18n";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { highlightRing } from "./matrixTints";
import { tileColors } from "./matrixTileDim";
import { useMatrixCellTileProps } from "./MatrixCellTileContext";
import { MatrixTileItem } from "./types";
import visuallyHidden from "../../utils/internal/visuallyHidden";

/**
 * The "+N" marker: a small badge in the tile's top right corner, where the
 * topRight corner of the entry beneath it would be, so it never lies on a
 * label. Its body and its border are the grid's background and text colors:
 * whatever fill it lies on, one of the two stands out from it.
 */
export const MatrixTileOverflowRoot = styled("div", {
	name: "CcMatrixCellTile",
	slot: "overflow",
})(({ theme }) => ({
	position: "absolute",
	top: 3,
	right: 3,
	boxSizing: "border-box",
	minWidth: 14,
	height: 14,
	padding: "0 2px",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: 7,
	border: `1px solid ${theme.palette.text.primary}`,
	backgroundColor: theme.palette.background.paper,
	color: theme.palette.text.primary,
	fontFamily: theme.typography.fontFamily,
	fontSize: 10,
	fontWeight: 700,
	lineHeight: 1,
	[`&.${matrixClasses.overflowHighlighted}`]: {
		boxShadow: highlightRing(theme),
	},
}));

/** What the marker says to a screen reader, visually hidden */
const OverflowName = styled("span")(visuallyHidden);

/** The tooltip's list of the entries left out, one per line */
const OverflowList = styled("div")({
	display: "flex",
	flexDirection: "column",
	gap: 4,
});

const OverflowLine = styled("div")({
	display: "flex",
	alignItems: "center",
	gap: 6,
});

/**
 * An entry's label as the tile draws it: on its fill (faded if dimmed) over
 * the grid's background, in its label color
 */
const OverflowSwatch = styled("span")(({ theme }) => ({
	flexShrink: 0,
	boxSizing: "border-box",
	minWidth: 20,
	height: 20,
	padding: "0 3px",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: theme.palette.background.paper,
	backgroundImage: `linear-gradient(${cssVar(
		matrixVars.tileBackground,
	)}, ${cssVar(matrixVars.tileBackground)})`,
	color: cssVar(matrixVars.tileForeground),
	fontSize: 11,
	fontWeight: 700,
	lineHeight: 1,
}));

/**
 * The tile never suspends: while the translations load, the marker says its
 * text in English, then re-renders.
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };

export interface MatrixTileOverflowProps {
	/**
	 * The entries the tile does not draw, in the order of MatrixCellTileProps.items
	 */
	items: MatrixTileItem[];
}

/**
 * Stands for the entries a MatrixCellTile has no room for: draws "+N", shows
 * them on hover (each by its label, in its colors, and its tooltip), says them
 * to screen readers ("2 more: N (Night shift), RD") and is ringed when one of
 * them is highlighted. Not a control: it opens nothing, and a press on it is a
 * press on the cell.
 */
const MatrixTileOverflow = (props: MatrixTileOverflowProps) => {
	const { items } = props;
	const { classes } = useMatrixCellTileProps();
	const theme = useTheme();
	const { t } = useTranslation("translation", TRANSLATION_OPTIONS);
	const count = items.length;

	const list = useMemo(
		() => (
			<OverflowList>
				{items.map((item) => {
					const colors = tileColors(
						theme,
						item.backgroundColor,
						item.textColor,
						item.dimmed,
					);
					const style = {
						[matrixVars.tileBackground]: colors.fill,
						[matrixVars.tileForeground]: colors.label,
					} as React.CSSProperties;
					return (
						<OverflowLine key={item.key}>
							<OverflowSwatch style={style}>{item.label}</OverflowSwatch>
							{item.tooltip && <span>{item.tooltip}</span>}
						</OverflowLine>
					);
				})}
			</OverflowList>
		),
		[items, theme],
	);

	return (
		// describeChild: while open the list describes the marker; it has no
		// name to replace
		<Tooltip title={list} enterDelay={400} describeChild>
			<MatrixTileOverflowRoot
				className={combineClassNames([
					classes?.overflow,
					items.some((item) => item.highlighted) &&
						matrixClasses.overflowHighlighted,
				])}
			>
				<span aria-hidden>{`+${count}`}</span>
				<OverflowName>
					{t("standalone.matrix.tile-more", {
						count,
						defaultValue: "{{count}} more:",
					})}
					{items.map((item, index) => (
						<React.Fragment key={item.key}>
							{index > 0 ? ", " : " "}
							{item.label}
							{item.tooltip && ` (${item.tooltip})`}
						</React.Fragment>
					))}
				</OverflowName>
			</MatrixTileOverflowRoot>
		</Tooltip>
	);
};

export default React.memo(MatrixTileOverflow);
