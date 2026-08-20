import React from "react";
import { styled } from "@mui/material";
import { cssVar, matrixVars } from "./matrixClasses";
import { cellBorders } from "./matrixTints";
import { useMatrixConfig } from "./MatrixGridContext";
import { MatrixExtraRow } from "./types";

export const MatrixExtraRowHeaderRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "extraRowHeader",
})(({ theme }) => ({
	position: "sticky",
	left: 0,
	zIndex: 1,
	height: cssVar(matrixVars.extraRowHeight),
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

export interface MatrixExtraRowHeaderProps {
	/**
	 * The aggregate row this header stands for
	 */
	extraRow: MatrixExtraRow;
}

const MatrixExtraRowHeader = (props: MatrixExtraRowHeaderProps) => {
	const { classes } = useMatrixConfig<unknown>();
	return (
		<MatrixExtraRowHeaderRoot className={classes?.extraRowHeader}>
			{props.extraRow.header}
		</MatrixExtraRowHeaderRoot>
	);
};

export default React.memo(MatrixExtraRowHeader);
