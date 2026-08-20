import React, { useCallback, useMemo } from "react";
import { styled } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { cellBorders } from "./matrixTints";
import { useMatrixConfig } from "./MatrixGridContext";
import { MatrixRow } from "./types";

export const MatrixRowHeaderRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "rowHeader",
})(({ theme }) => ({
	position: "sticky",
	left: 0,
	zIndex: 1,
	height: cssVar(matrixVars.rowHeight),
	minWidth: 0,
	overflow: "hidden",
	backgroundColor: theme.palette.background.paper,
	...cellBorders(theme),
	[`&.${matrixClasses.rowHeaderButton}`]: {
		cursor: "pointer",
		WebkitTapHighlightColor: "transparent",
		"&:active": { backgroundColor: theme.palette.action.hover },
		"&:focus-visible": {
			outline: `2px solid ${theme.palette.primary.main}`,
			outlineOffset: -2,
		},
	},
}));

export interface MatrixRowHeaderProps<TCell> {
	/**
	 * The row this header stands for
	 */
	row: MatrixRow<TCell>;
}

const MatrixRowHeader = <TCell,>(props: MatrixRowHeaderProps<TCell>) => {
	const { row } = props;
	const { renderRowHeader, onRowHeaderActions, classes, touch } =
		useMatrixConfig<TCell>();
	const button = touch && !!onRowHeaderActions;
	const handleClick = useCallback(() => {
		onRowHeaderActions?.(row.key);
	}, [onRowHeaderActions, row.key]);
	// The tap target has to answer to a keyboard too: on touch it is the only
	// path to the row actions, since the header's own buttons are suppressed.
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key !== "Enter" && event.key !== " ") return;
			event.preventDefault();
			onRowHeaderActions?.(row.key);
		},
		[onRowHeaderActions, row.key],
	);
	const context = useMemo(() => ({ touch }), [touch]);
	const content = useMemo(
		() => renderRowHeader(row, context),
		[renderRowHeader, row, context],
	);
	return (
		<MatrixRowHeaderRoot
			className={combineClassNames([
				classes?.rowHeader,
				button && matrixClasses.rowHeaderButton,
			])}
			role={button ? "button" : undefined}
			tabIndex={button ? 0 : undefined}
			aria-label={button ? row.label : undefined}
			onClick={button ? handleClick : undefined}
			onKeyDown={button ? handleKeyDown : undefined}
		>
			{content}
		</MatrixRowHeaderRoot>
	);
};

export default React.memo(MatrixRowHeader) as typeof MatrixRowHeader;
