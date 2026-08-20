import React, { useMemo } from "react";
import { styled } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { cellBorders, stickyColumnTintStyles } from "./matrixTints";
import { useMatrixConfig } from "./MatrixGridContext";
import { MatrixColumn, MatrixColumnVariant } from "./types";

export const MatrixColumnHeaderRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "columnHeader",
})(({ theme }) => {
	return {
		position: "sticky",
		top: 0,
		zIndex: 2,
		height: cssVar(matrixVars.headerHeight),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		lineHeight: 1.1,
		...cellBorders(theme),
		// the accent column also gets an underline in its header
		...stickyColumnTintStyles(theme, {
			boxShadow: `inset 0 -3px 0 ${theme.palette.info.main}`,
		}),
	};
});

export const MatrixColumnHeaderLabel = styled("div", {
	name: "CcMatrixGrid",
	slot: "columnHeaderLabel",
})(({ theme }) => ({
	fontWeight: 700,
	fontSize: "0.8rem",
	[`.${matrixClasses.columnCurrent} > &`]: {
		color:
			theme.palette.mode === "dark"
				? theme.palette.warning.light
				: theme.palette.warning.dark,
	},
	[`.${matrixClasses.columnAccent} > &`]: {
		color: theme.palette.info.main,
	},
}));

export const MatrixColumnHeaderSubLabel = styled("div", {
	name: "CcMatrixGrid",
	slot: "columnHeaderSubLabel",
})(({ theme }) => ({
	fontSize: "0.62rem",
	textTransform: "uppercase",
	color: theme.palette.text.secondary,
}));

/** The state class of a column variant, or false for "normal". */
export const columnVariantClass = (
	variant: MatrixColumnVariant | undefined,
): string | false => {
	switch (variant) {
		case "muted":
			return matrixClasses.columnMuted;
		case "current":
			return matrixClasses.columnCurrent;
		case "accent":
			return matrixClasses.columnAccent;
		default:
			return false;
	}
};

export interface MatrixColumnHeaderProps {
	/**
	 * The column this header stands for
	 */
	column: MatrixColumn;
	/**
	 * Ref to the header cell, set on the column the grid scrolls to
	 */
	innerRef?: React.Ref<HTMLDivElement>;
}

const MatrixColumnHeader = (props: MatrixColumnHeaderProps) => {
	const { column } = props;
	const { renderColumnHeader, classes } = useMatrixConfig<unknown>();
	const content = useMemo(
		() =>
			renderColumnHeader ? (
				renderColumnHeader(column)
			) : (
				<>
					<MatrixColumnHeaderLabel className={classes?.columnHeaderLabel}>
						{column.label}
					</MatrixColumnHeaderLabel>
					{column.subLabel != null && (
						<MatrixColumnHeaderSubLabel
							className={classes?.columnHeaderSubLabel}
						>
							{column.subLabel}
						</MatrixColumnHeaderSubLabel>
					)}
				</>
			),
		[
			renderColumnHeader,
			column,
			classes?.columnHeaderLabel,
			classes?.columnHeaderSubLabel,
		],
	);
	return (
		<MatrixColumnHeaderRoot
			ref={props.innerRef}
			className={combineClassNames([
				classes?.columnHeader,
				columnVariantClass(column.variant),
			])}
		>
			{content}
		</MatrixColumnHeaderRoot>
	);
};

export default React.memo(MatrixColumnHeader);
