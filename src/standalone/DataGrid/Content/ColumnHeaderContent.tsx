import React, { SyntheticEvent, useCallback, useState } from "react";
import {
	Box,
	Grid,
	IconButton,
	Popover,
	PopoverOrigin,
	Tooltip,
} from "@material-ui/core";
import {
	ArrowDownward,
	ArrowUpward,
	FilterList as FilterIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import FilterEntry, { IFilterDef } from "./FilterEntry";
import i18n from "../../../i18n";

export interface IDataGridContentColumnHeaderContentProps {
	/**
	 * The header label
	 */
	headerName: string;
	/**
	 * Allow resizing of column (disabled for locked columns)
	 */
	enableResize: boolean;
	/**
	 * Start dragging callback
	 */
	startDrag: () => void;
	/**
	 * The currently active sort
	 */
	sort: -1 | 0 | 1;
	/**
	 * The sort priority (lower = higher priority)
	 */
	sortOrder: number | undefined;
	/**
	 * The currently active filter
	 */
	filter?: IFilterDef;
	/**
	 * Updates the filter
	 * @param value The new filter
	 */
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
	sortIcon: {
		height: 24,
	},
	disableClick: {
		pointerEvents: "none",
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

const ColumnHeaderContent = (
	props: IDataGridContentColumnHeaderContentProps
) => {
	const classes = useStyles();
	const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
		null
	);

	const openFilter = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			setFilterAnchorEl(event.currentTarget);
		},
		[setFilterAnchorEl]
	);
	const closeFilter = useCallback(() => setFilterAnchorEl(null), [
		setFilterAnchorEl,
	]);
	const preventPropagation = useCallback(
		(evt: SyntheticEvent<{}>) => evt.stopPropagation(),
		[]
	);

	return (
		<>
			<Grid container justify={"space-between"}>
				<Grid item className={classes.disableClick}>
					<Grid container justify={"flex-start"}>
						<Grid item>{props.headerName}</Grid>
						<Grid item className={classes.sortIcon}>
							{props.sort === -1 && <ArrowDownward />}
							{props.sort === 1 && <ArrowUpward />}
						</Grid>
						<Grid item>{props.sort !== 0 && props.sortOrder?.toString()}</Grid>
					</Grid>
				</Grid>
				<Grid item>
					<Tooltip title={i18n.t("standalone.data-grid.content.filter")!}>
						<IconButton className={classes.filterButton} onClick={openFilter}>
							<FilterIcon />
						</IconButton>
					</Tooltip>
				</Grid>
			</Grid>
			{props.enableResize && (
				<div
					className={classes.resizer}
					onMouseDown={props.startDrag}
					onClick={preventPropagation}
				/>
			)}
			<Popover
				open={filterAnchorEl !== null}
				anchorEl={filterAnchorEl}
				onClose={closeFilter}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
				onBackdropClick={preventPropagation}
				onClick={preventPropagation}
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
};

export default React.memo(ColumnHeaderContent);
