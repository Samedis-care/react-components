import React, { useCallback, useState } from "react";
import {
	Box,
	Grid,
	IconButton,
	Popover,
	PopoverOrigin,
} from "@material-ui/core";
import {
	ArrowDownward,
	ArrowUpward,
	FilterList as FilterIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import FilterEntry, { IFilterDef } from "./FilterEntry";

export interface IDataGridContentColumnHeaderContentProps {
	headerName: string;
	disableResize: boolean;
	startDrag: () => void;
	sort: -1 | 0 | 1;
	filter?: IFilterDef;
	onFilterChange: (value: IFilterDef) => void;
}

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
	filterPopup: {
		width: 150,
	},
});

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "center",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

export default React.memo((props: IDataGridContentColumnHeaderContentProps) => {
	const classes = useStyles();
	const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
		null
	);

	const openFilter = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) =>
			setFilterAnchorEl(event.currentTarget),
		[setFilterAnchorEl]
	);
	const closeFilter = useCallback(() => setFilterAnchorEl(null), [
		setFilterAnchorEl,
	]);

	return (
		<>
			<Grid container justify={"space-between"}>
				<Grid item>
					<Grid container justify={"flex-start"}>
						<Grid item>{props.headerName}</Grid>
						<Grid item>
							{props.sort === -1 && <ArrowDownward />}
							{props.sort === 1 && <ArrowUpward />}
						</Grid>
					</Grid>
				</Grid>
				<Grid item>
					<IconButton className={classes.filterButton} onClick={openFilter}>
						<FilterIcon />
					</IconButton>
				</Grid>
			</Grid>
			{props.disableResize && (
				<div className={classes.resizer} onMouseDown={props.startDrag} />
			)}
			<Popover
				open={filterAnchorEl !== null}
				anchorEl={filterAnchorEl}
				onClose={closeFilter}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
			>
				<Box m={2}>
					<Grid container className={classes.filterPopup}>
						<FilterEntry
							valueType={"string"}
							onChange={props.onFilterChange}
							value={props.filter}
						/>
					</Grid>
				</Box>
			</Popover>
		</>
	);
});
