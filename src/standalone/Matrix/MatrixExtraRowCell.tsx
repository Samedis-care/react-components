import React, { useCallback, useEffect, useId, useRef } from "react";
import { styled } from "@mui/material";
import { Add } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import {
	columnVariantClass,
	cssVar,
	matrixClasses,
	matrixVars,
} from "./matrixClasses";
import { cellBorders, columnTintStyles } from "./matrixTints";
import { ownEntryOf, useMatrixConfig } from "./MatrixGridContext";
import MatrixContents from "./MatrixContents";
import useMatrixActivation from "./useMatrixActivation";
import { columnNameOf, extraRowNameOf, isNamePart } from "./matrixNames";
import { MatrixColumn, MatrixExtraRow } from "./types";

export const MatrixExtraCellRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "extraCell",
})(({ theme }) => ({
	height: cssVar(matrixVars.extraRowHeight),
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	...cellBorders(theme),
	...columnTintStyles(theme),
	[`&.${matrixClasses.extraCellClickable}`]: {
		cursor: "pointer",
		"&:hover": { backgroundColor: theme.palette.action.hover },
		"&:hover .MuiSvgIcon-root": { opacity: 1 },
		// No hover on a touch device, so the hint has to be there from the
		// start: without it the cell is an empty button.
		[`&.${matrixClasses.touch} .MuiSvgIcon-root`]: { opacity: 1 },
		"&:focus-visible": {
			outline: `2px solid ${theme.palette.primary.main}`,
			outlineOffset: -2,
		},
	},
}));

export const MatrixBadge = styled("div", {
	name: "CcMatrixGrid",
	slot: "badge",
})(({ theme }) => ({
	minWidth: 22,
	height: 22,
	padding: theme.spacing(0, 0.5),
	borderRadius: 11,
	backgroundColor: theme.palette.warning.main,
	color: theme.palette.warning.contrastText,
	fontSize: "0.72rem",
	fontWeight: 700,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
}));

export const MatrixExtraCellAddHint = styled(Add, {
	name: "CcMatrixGrid",
	slot: "extraCellAddHint",
})(({ theme }) => ({
	fontSize: 15,
	opacity: 0,
	color: theme.palette.text.disabled,
}));

export interface MatrixExtraRowCellProps {
	/**
	 * The aggregate row this cell belongs to
	 */
	extraRow: MatrixExtraRow;
	/**
	 * The column this cell belongs to
	 */
	column: MatrixColumn;
	/**
	 * Is this the cell of its row that is in the tab order?
	 */
	tabStop: boolean;
	/**
	 * Take the focus now (an arrow key moved it here)
	 */
	pullFocus: boolean;
	/**
	 * An arrow key was pressed on this cell
	 */
	onNavigate: (
		fromColumnKey: string,
		to: "previous" | "next" | "first" | "last",
	) => void;
	/**
	 * This cell took the focus, so its row remembers it as the tab stop
	 */
	onFocusColumn: (columnKey: string) => void;
	/**
	 * The name of a clickable cell that has nothing else to be named by: no
	 * getCellLabel, no text for its row or its column, and no badge. It shows
	 * the "+" hint, so this says "Add" in the current language.
	 */
	addName: string;
}

const MatrixExtraRowCell = (props: MatrixExtraRowCellProps) => {
	const { extraRow, column, addName } = props;
	const { classes, touch } = useMatrixConfig<unknown>();
	const onCellClick = extraRow.onCellClick;
	const activate = useCallback(() => {
		onCellClick?.(column.key);
	}, [onCellClick, column.key]);
	// Zero is a value: only a missing (or null) badge means "nothing known".
	const badge = ownEntryOf(extraRow.badges, column.key);
	const hasBadge = badge != null;
	// The cell in words: getCellLabel, else the row's and the column's names
	// ("Open demand, Thursday, March 5, 2026"), so that the cells of a row do
	// not all sound alike. Without any of them a cell with a badge is named by
	// its badge, and one without by addName, for its "+".
	const name =
		extraRow.getCellLabel?.(column.key) ||
		[extraRowNameOf(extraRow), columnNameOf(column)]
			.filter(isNamePart)
			.join(", ") ||
		(hasBadge ? undefined : addName);
	const activation = useMatrixActivation(
		onCellClick ? activate : undefined,
		name,
	);
	// The aria-label replaces the cell's content, badge included. A named cell
	// that shows a badge is labelled by the badge and then by itself (whose
	// part of that is its aria-label): "9 Open demand, Thursday, March 5, 2026".
	const id = useId();
	const badgeId = `${id}-badge`;
	const labelledByBadge = !!activation && !!name && hasBadge;
	const ref = useRef<HTMLDivElement>(null);
	const { tabStop, pullFocus, onNavigate, onFocusColumn } = props;
	useEffect(() => {
		if (pullFocus) ref.current?.focus();
	}, [pullFocus]);
	const handleFocus = useCallback(() => {
		onFocusColumn(column.key);
	}, [onFocusColumn, column.key]);
	// The arrow keys walk the row; Enter and Space come from the activation.
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			const to =
				event.key === "ArrowRight"
					? "next"
					: event.key === "ArrowLeft"
						? "previous"
						: event.key === "Home"
							? "first"
							: event.key === "End"
								? "last"
								: null;
			if (!to) {
				activation?.onKeyDown(event);
				return;
			}
			event.preventDefault();
			onNavigate(column.key, to);
		},
		[activation, onNavigate, column.key],
	);
	const clickable = !!onCellClick;
	// The grid cell is a wrapper of its own: a clickable cell is a button,
	// which cannot be the grid cell too. Always there, so the cell is not
	// re-created when onCellClick comes or goes.
	return (
		<MatrixContents role={"gridcell"}>
			<MatrixExtraCellRoot
				className={combineClassNames([
					classes?.extraCell,
					columnVariantClass(column.variant),
					clickable && matrixClasses.extraCellClickable,
					touch && matrixClasses.touch,
				])}
				{...activation}
				id={labelledByBadge ? id : undefined}
				aria-labelledby={labelledByBadge ? `${badgeId} ${id}` : undefined}
				ref={ref}
				tabIndex={clickable ? (tabStop ? 0 : -1) : undefined}
				onKeyDown={clickable ? handleKeyDown : undefined}
				onFocus={clickable ? handleFocus : undefined}
			>
				{hasBadge ? (
					<MatrixBadge
						id={labelledByBadge ? badgeId : undefined}
						className={classes?.badge}
					>
						{badge}
					</MatrixBadge>
				) : (
					clickable && (
						<MatrixExtraCellAddHint className={classes?.extraCellAddHint} />
					)
				)}
			</MatrixExtraCellRoot>
		</MatrixContents>
	);
};

export default React.memo(MatrixExtraRowCell);
