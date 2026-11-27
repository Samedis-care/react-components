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
	DataGridColumnHeaderFilterPopupDateTime,
	DataGridColumnHeaderFilterPopupEnum,
	DataGridColumnHeaderFilterPopupId,
	DataGridColumnHeaderLabel,
	DataGridColumnHeaderLabelText,
	DataGridColumnHeaderResizer,
	DataGridColumnHeaderSortButton,
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
	 * Start dragging callback, called with the press on the resize handle
	 * @param evt The mouse down event
	 */
	startDrag: (evt: React.MouseEvent) => void;
	/**
	 * Called on a double click on the resize handle: fits the column to its
	 * content
	 * @param evt The double click event; its currentTarget is the handle
	 */
	autoResize: (evt: React.MouseEvent<HTMLElement>) => void;
	/**
	 * Can the column be sorted? The label is then a sort button, else a tab
	 * stop when it is a string.
	 */
	sortable: boolean;
	/**
	 * Called when Enter or Space is pressed on the sort button: steps the
	 * column's sort as a click on the header does
	 * @param additional Shift was held: add or remove the column as a further
	 * sort, as Shift+click does
	 */
	onSort: (additional: boolean) => void;
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
		(evt?: unknown, reason?: "backdropClick" | "escapeKeyDown") => {
			if (reason === "backdropClick") {
				(evt as React.SyntheticEvent).stopPropagation();
			}
			setFilterAnchorEl(null);
		},
		[setFilterAnchorEl],
	);
	const preventPropagation = useCallback(
		(evt: SyntheticEvent<unknown>) => evt.stopPropagation(),
		[],
	);
	// Enter (when pressed) and Space (when released) sort here, not through the
	// click the button fires for them: that click does not carry Shift in every
	// browser. preventDefault keeps the button from firing it, so the header's
	// click handler does not sort a second time. Clicks with the pointer or
	// from assistive technology reach the header's click handler as before.
	const { onSort } = props;
	const onSortButtonKeyDown = useCallback(
		(evt: React.KeyboardEvent<HTMLButtonElement>) => {
			if (evt.key !== "Enter" || evt.target !== evt.currentTarget) return;
			evt.preventDefault();
			// a held Enter sorts once
			if (!evt.repeat) onSort(evt.shiftKey);
		},
		[onSort],
	);
	const onSortButtonKeyUp = useCallback(
		(evt: React.KeyboardEvent<HTMLButtonElement>) => {
			if (evt.key !== " " || evt.target !== evt.currentTarget) return;
			evt.preventDefault();
			onSort(evt.shiftKey);
		},
		[onSort],
	);

	const label =
		typeof props.headerName === "string"
			? props.headerName.split("\n").map((text, index, arr) => (
					// keyed by position: two lines can have the same text
					<React.Fragment key={index}>
						{text}
						{index == arr.length - 1 ? undefined : <br />}
					</React.Fragment>
				))
			: props.headerName;

	const CurrentFilterIcon =
		props.filter && props.filter.value1
			? DataGridColumnHeaderFilterActiveIcon
			: DataGridColumnHeaderFilterIcon;

	const ColumnHeaderFilterPopupComp =
		props.columnType === "datetime"
			? DataGridColumnHeaderFilterPopupDateTime
			: props.columnType === "enum"
				? DataGridColumnHeaderFilterPopupEnum
				: props.columnType === "id"
					? DataGridColumnHeaderFilterPopupId
					: DataGridColumnHeaderFilterPopup;

	return (
		<>
			<Grid container sx={{ justifyContent: "flex-start" }} wrap={"nowrap"}>
				<DataGridColumnHeaderLabel
					className={classes?.columnHeaderLabel}
					key={"header"}
				>
					<Tooltip title={props.headerName}>
						{props.sortable ? (
							<DataGridColumnHeaderSortButton
								className={classes?.columnHeaderSortButton}
								onKeyDown={onSortButtonKeyDown}
								onKeyUp={onSortButtonKeyUp}
								disableRipple
							>
								{label}
							</DataGridColumnHeaderSortButton>
						) : (
							<DataGridColumnHeaderLabelText
								className={classes?.columnHeaderLabelText}
								// the keyboard's way to the tooltip, with the full text of
								// a label cut off. An element keeps what it is: a focusable
								// element in it shows the tooltip
								tabIndex={typeof props.headerName === "string" ? 0 : undefined}
							>
								{label}
							</DataGridColumnHeaderLabelText>
						)}
					</Tooltip>
				</DataGridColumnHeaderLabel>
				<DataGridColumnHeaderSortIcon className={classes?.columnHeaderSortIcon}>
					{props.sort === -1 && <ArrowDownward />}
					{props.sort === 1 && <ArrowUpward />}
				</DataGridColumnHeaderSortIcon>
				<Grid size="grow">
					{props.sort !== 0 && props.sortOrder?.toString()}
				</Grid>
				{props.filterable && (
					<Grid key={"filter"}>
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
				onClick={preventPropagation}
			>
				<Box sx={{ m: 2 }}>
					<ColumnHeaderFilterPopupComp
						container
						className={
							props.columnType === "datetime"
								? classes?.columnHeaderFilterPopupDateTime
								: props.columnType === "enum"
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
