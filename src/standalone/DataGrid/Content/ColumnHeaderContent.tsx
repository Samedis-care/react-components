import React, { SyntheticEvent, useCallback, useState } from "react";
import { Box, Grid, Popover, PopoverOrigin, Tooltip } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import FilterEntry, { IFilterDef } from "./FilterEntry";
import { ModelFilterType } from "../../../backend-integration/Model";
import {
	DataGridColumnHeaderFilterActiveIcon,
	DataGridColumnHeaderFilterButton,
	DataGridColumnHeaderFilterIcon,
	DataGridColumnHeaderFilterPopup,
	DataGridColumnHeaderFilterPopupEnum,
	DataGridColumnHeaderLabel,
	DataGridColumnHeaderResizer,
	DataGridColumnHeaderSortIcon,
	IDataGridColumnDef,
	useDataGridProps,
} from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import combineClassNames from "../../../utils/combineClassNames";

export interface IDataGridContentColumnHeaderContentProps {
	/**
	 * The column field name
	 */
	field: string;
	/**
	 * The header columnHeaderLabel
	 */
	headerName: NonNullable<React.ReactNode>;
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

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "center",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

const ColumnHeaderContent = (
	props: IDataGridContentColumnHeaderContentProps,
) => {
	const { t } = useCCTranslations();
	const { classes } = useDataGridProps();
	const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
		null,
	);

	const openFilter = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			setFilterAnchorEl(event.currentTarget);
		},
		[setFilterAnchorEl],
	);
	const closeFilter = useCallback(
		() => setFilterAnchorEl(null),
		[setFilterAnchorEl],
	);
	const preventPropagation = useCallback(
		(evt: SyntheticEvent<unknown>) => evt.stopPropagation(),
		[],
	);

	const CurrentFilterIcon =
		props.filter && props.filter.value1
			? DataGridColumnHeaderFilterActiveIcon
			: DataGridColumnHeaderFilterIcon;

	const ColumnHeaderFilterPopupComp =
		props.columnType === "enum"
			? DataGridColumnHeaderFilterPopupEnum
			: DataGridColumnHeaderFilterPopup;

	return (
		<>
			<Grid container justifyContent={"flex-start"} wrap={"nowrap"}>
				<DataGridColumnHeaderLabel
					item
					className={classes?.columnHeaderLabel}
					key={"header"}
				>
					<Tooltip title={props.headerName}>
						<span>
							{typeof props.headerName === "string"
								? props.headerName.split("\n").map((text, index, arr) => (
										<React.Fragment key={text}>
											{text}
											{index == arr.length - 1 ? undefined : <br />}
										</React.Fragment>
									))
								: props.headerName}
						</span>
					</Tooltip>
				</DataGridColumnHeaderLabel>
				<DataGridColumnHeaderSortIcon
					item
					className={classes?.columnHeaderSortIcon}
				>
					{props.sort === -1 && <ArrowDownward />}
					{props.sort === 1 && <ArrowUpward />}
				</DataGridColumnHeaderSortIcon>
				<Grid item xs>
					{props.sort !== 0 && props.sortOrder?.toString()}
				</Grid>
				{props.filterable && (
					<Grid item key={"filter"}>
						<Tooltip title={t("standalone.data-grid.content.filter") || ""}>
							<DataGridColumnHeaderFilterButton
								className={combineClassNames([
									classes?.columnHeaderFilterButton,
									props.filter?.value1 &&
										"CcDataGrid-columnHeaderFilterButtonActive",
								])}
								onClick={openFilter}
								size="large"
							>
								<CurrentFilterIcon
									className={
										props.filter?.value1
											? classes?.columnHeaderFilterActiveIcon
											: classes?.columnHeaderFilterIcon
									}
								/>
							</DataGridColumnHeaderFilterButton>
						</Tooltip>
					</Grid>
				)}
			</Grid>
			{props.enableResize && (
				<DataGridColumnHeaderResizer
					className={classes?.columnHeaderResizer}
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
				onBackdropClick={preventPropagation} // suggested fix for deprecated attribute is to use onClose reason. but onClose does not supply a event (at least not according to typescript)
				onClick={preventPropagation}
			>
				<Box m={2}>
					<ColumnHeaderFilterPopupComp
						container
						className={
							props.columnType === "enum"
								? classes?.columnHeaderFilterPopupEnum
								: classes?.columnHeaderFilterPopup
						}
					>
						<FilterEntry
							field={props.field}
							valueType={props.columnType}
							onChange={props.onFilterChange}
							value={props.filter}
							valueData={props.filterData}
							close={closeFilter}
							depth={1}
						/>
					</ColumnHeaderFilterPopupComp>
				</Box>
			</Popover>
		</>
	);
};

export default React.memo(ColumnHeaderContent);
