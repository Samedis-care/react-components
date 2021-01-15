import React, { SyntheticEvent, useCallback, useState } from "react";
import {
	Box,
	Grid,
	IconButton,
	Popover,
	PopoverOrigin,
	Tooltip,
} from "@material-ui/core";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import FilterIcon from "../../Icons/FilterIcon";
import { makeStyles } from "@material-ui/core/styles";
import FilterEntry, { IFilterDef } from "./FilterEntry";
import i18n from "../../../i18n";
import { ModelFilterType } from "../../../backend-integration/Model";
import { IDataGridColumnDef } from "../index";

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
	 * Automatic resize callback
	 */
	autoResize: () => void;
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
	 * Can the column be filtered?
	 */
	filterable: boolean;
	/**
	 * Updates the filter
	 * @param value The new filter
	 */
	onFilterChange: (value: IFilterDef) => void;
	/**
	 * The type of the column
	 */
	columnType: ModelFilterType;
	/**
	 * The filter data of the column
	 */
	filterData: IDataGridColumnDef["filterData"];
}

const useStyles = makeStyles({
	filterButton: {
		padding: 0,
		color: "inherit",
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
	filterIcon: {
		width: 16,
		height: "auto",
	},
	sortIcon: {
		height: 24,
	},
	label: {
		textOverflow: "ellipsis",
		overflow: "hidden",
		"&:hover": {
			pointerEvents: "auto",
		},
	},
	disableClick: {
		userSelect: "none",
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
		(evt: SyntheticEvent<unknown>) => evt.stopPropagation(),
		[]
	);

	return (
		<>
			<Grid container justify={"flex-start"} wrap={"nowrap"}>
				<Grid
					item
					className={`${classes.disableClick} ${classes.label}`}
					key={"header"}
				>
					<Tooltip title={props.headerName}>
						<span>{props.headerName}</span>
					</Tooltip>
				</Grid>
				<Grid item className={classes.sortIcon}>
					{props.sort === -1 && <ArrowDownward />}
					{props.sort === 1 && <ArrowUpward />}
				</Grid>
				<Grid item xs>
					{props.sort !== 0 && props.sortOrder?.toString()}
				</Grid>
				{props.filterable && (
					<Grid item key={"filter"}>
						<Tooltip
							title={i18n.t("standalone.data-grid.content.filter") || ""}
						>
							<IconButton className={classes.filterButton} onClick={openFilter}>
								<FilterIcon className={classes.filterIcon} />
							</IconButton>
						</Tooltip>
					</Grid>
				)}
			</Grid>
			{props.enableResize && (
				<div
					className={classes.resizer}
					onMouseDown={props.startDrag}
					onClick={preventPropagation}
					onDoubleClick={props.autoResize}
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
							valueType={props.columnType}
							onChange={props.onFilterChange}
							value={props.filter}
							valueData={props.filterData}
							depth={1}
						/>
					</Grid>
				</Box>
			</Popover>
		</>
	);
};

export default React.memo(ColumnHeaderContent);
