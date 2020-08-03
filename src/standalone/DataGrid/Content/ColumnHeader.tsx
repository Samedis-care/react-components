import React, { useCallback, useEffect, useState } from "react";
import {
	createStyles,
	Grid,
	IconButton,
	TableCell,
	Theme,
	useTheme,
	withStyles,
} from "@material-ui/core";
import { FilterList as FilterIcon } from "@material-ui/icons";
import { measureText } from "../../../utils";
import { IDataGridColumnDef } from "../index";
import { makeStyles } from "@material-ui/core/styles";

export interface IDataGridContentColumnHeaderProps {
	column: IDataGridColumnDef;
}

const stickyHeaderCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		top: 0,
		backgroundColor: theme.palette.background.paper,
		borderBottom: `1px solid ${theme.palette.divider}`,
		borderRight: `1px solid ${theme.palette.divider}`,
		zIndex: 1000,
	},
}));
const StickyHeaderCell = withStyles(stickyHeaderCellStyles)(TableCell);

const useStyles = makeStyles({
	filterButton: {
		padding: 0,
	},
	resizer: {
		cursor: "col-resize",
		width: 8,
		height: "100%",
		right: 0,
		top: 0,
		position: "absolute",
	},
});

export default React.memo((props: IDataGridContentColumnHeaderProps) => {
	const theme = useTheme();
	const classes = useStyles();
	const [width, setWidth] = useState<number>(
		() =>
			measureText(theme.typography.body1.font!, props.column.headerName).width +
			100
	);
	const [dragging, setDragging] = useState(false);

	const startDrag = useCallback(() => setDragging(true), [setDragging]);
	const stopDrag = useCallback(() => setDragging(false), [setDragging]);
	const onDrag = useCallback(
		(evt: MouseEvent) => {
			if (!dragging) return;
			evt.preventDefault();

			const move = evt.movementX;
			setWidth((prevState) => prevState + move);
		},
		[dragging, setWidth]
	);

	useEffect(() => {
		document.addEventListener("mousemove", onDrag);
		document.addEventListener("mouseup", stopDrag);

		return () => {
			document.removeEventListener("mousemove", onDrag);
			document.addEventListener("mouseup", stopDrag);
		};
	}, [onDrag, stopDrag]);

	return (
		<StickyHeaderCell
			style={{
				minWidth: width,
			}}
		>
			<Grid container justify={"space-between"}>
				<Grid item>{props.column.headerName}</Grid>
				<Grid item>
					<IconButton className={classes.filterButton}>
						<FilterIcon />
					</IconButton>
				</Grid>
			</Grid>
			<div className={classes.resizer} onMouseDown={startDrag} />
		</StickyHeaderCell>
	);
});
