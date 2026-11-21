import React, { useCallback, useMemo } from "react";
import { styled } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { cellBorders } from "./matrixTints";
import { useMatrixConfig } from "./MatrixGridContext";
import MatrixContents from "./MatrixContents";
import useMatrixActivation from "./useMatrixActivation";
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
	const activate = useCallback(() => {
		onRowHeaderActions?.(row.key);
	}, [onRowHeaderActions, row.key]);
	// The tap target has to answer to a keyboard too: on touch it is the only
	// path to the row actions, since the header's own buttons are suppressed.
	const activation = useMatrixActivation(
		button ? activate : undefined,
		row.label,
	);
	// touch tells the renderer to drop its own buttons, so it follows the tap
	// target, not the device: without onRowHeaderActions those buttons are the
	// only way to the row's actions
	const context = useMemo(() => ({ touch: button }), [button]);
	const content = useMemo(
		() => renderRowHeader(row, context),
		[renderRowHeader, row, context],
	);
	// The row's header cell is a wrapper of its own: on touch the header is a
	// button, which cannot be the header cell too. Always there, so the
	// contents do not remount when the header becomes a button or stops being
	// one.
	return (
		<MatrixContents role={"rowheader"}>
			<MatrixRowHeaderRoot
				className={combineClassNames([
					classes?.rowHeader,
					button && matrixClasses.rowHeaderButton,
				])}
				{...activation}
			>
				{content}
			</MatrixRowHeaderRoot>
		</MatrixContents>
	);
};

export default React.memo(MatrixRowHeader) as typeof MatrixRowHeader;
