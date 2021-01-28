import React, { useCallback, useEffect, useState } from "react";
import {
	IDataGridColumnDef,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridRootRef,
	useDataGridStyles,
} from "../index";
import ColumnHeaderContent from "./ColumnHeaderContent";
import { IFilterDef } from "./FilterEntry";

export interface IDataGridContentColumnHeaderProps {
	/**
	 * The column definition
	 */
	column: IDataGridColumnDef;
}

export const HEADER_PADDING = 32; // px

export const applyColumnWidthLimits = (
	column: IDataGridColumnDef,
	targetWidth: number
): number => {
	const { width } = column;
	const absMinWidth = HEADER_PADDING * (column.filterable ? 3 : 2);
	const wishMinWidth = (width && width[0]) || 0;
	const wishMaxWidth = (width && width[1]) || Number.MAX_SAFE_INTEGER;
	targetWidth = Math.max(targetWidth, absMinWidth, wishMinWidth);
	targetWidth = Math.min(targetWidth, wishMaxWidth);
	return targetWidth;
};

const ColumnHeader = (props: IDataGridContentColumnHeaderProps) => {
	const { column } = props;
	const { field, sortable, filterable } = column;
	const gridRoot = useDataGridRootRef();
	const [columnState, setColumnState] = useDataGridColumnState();
	const { sort, sortOrder, filter } = columnState[field];
	const [, setColumnWidthState] = useDataGridColumnsWidthState();
	const [dragging, setDragging] = useState(false);
	const classes = useDataGridStyles();

	const onFilterChange = useCallback(
		(field: string, newFilter: IFilterDef) => {
			setColumnState((prevState) => ({
				...prevState,
				[field]: {
					...prevState[field],
					filter: newFilter,
				},
			}));
		},
		[setColumnState]
	);
	const onSortChange = useCallback(
		(field: string, newSort: -1 | 0 | 1) => {
			setColumnState((prevState) => {
				let newColumnState = {
					...prevState,
					[field]: {
						...prevState[field],
						sort: newSort,
					},
				};

				if (newSort === 0) {
					// if disable sorting, adjust sort priority for others
					Object.keys(prevState)
						.filter(
							(otherField) =>
								prevState[otherField].sort !== 0 &&
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								prevState[field].sortOrder! < prevState[otherField].sortOrder!
						)
						.forEach((otherField) => {
							newColumnState = {
								...newColumnState,
								[otherField]: {
									...newColumnState[otherField],
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									sortOrder: newColumnState[otherField].sortOrder! - 1,
								},
							};
						});
				} else if (newSort === 1) {
					// if enable sorting, set to highest order
					const order =
						Object.keys(prevState).filter(
							(otherField) => prevState[otherField].sort !== 0
						).length + 1;
					newColumnState = {
						...newColumnState,
						[field]: {
							...newColumnState[field],
							sortOrder: order,
						},
					};
				}

				return newColumnState;
			});
		},
		[setColumnState]
	);

	const startDrag = useCallback(() => setDragging(true), [setDragging]);
	const stopDrag = useCallback(() => setDragging(false), [setDragging]);
	const onDrag = useCallback(
		(evt: MouseEvent) => {
			if (!dragging) return;
			evt.preventDefault();

			const move = evt.movementX;

			setColumnWidthState((prevState) => ({
				...prevState,
				[field]: applyColumnWidthLimits(column, prevState[field] + move),
			}));
		},
		[column, dragging, field, setColumnWidthState]
	);
	const onColumnClick = useCallback(() => {
		if (!sortable) return;

		if (sort === 0) onSortChange(field, 1);
		else if (sort === 1) onSortChange(field, -1);
		else if (sort === -1) onSortChange(field, 0);
	}, [sortable, field, sort, onSortChange]);
	const internalOnFilterChange = useCallback(
		(newFilter: IFilterDef) => onFilterChange(field, newFilter),
		[field, onFilterChange]
	);
	const autoResize = useCallback(() => {
		if (!gridRoot) return;

		let width = 0;

		gridRoot.querySelectorAll(".column-" + field).forEach((entry) => {
			const widthMeasurement = document.createElement("div");
			widthMeasurement.style.display = "inline";
			widthMeasurement.style.position = "absolute";
			widthMeasurement.style.left = "-99999px";
			widthMeasurement.style.height = getComputedStyle(entry).height;
			widthMeasurement.innerHTML = entry.innerHTML;
			document.body.appendChild(widthMeasurement);
			const entryWidth = widthMeasurement.clientWidth + HEADER_PADDING;
			document.body.removeChild(widthMeasurement);
			width = Math.max(width, entryWidth);
		});
		setColumnWidthState((prevState) => ({
			...prevState,
			[field]: applyColumnWidthLimits(column, width),
		}));
	}, [column, field, gridRoot, setColumnWidthState]);

	useEffect(() => {
		document.addEventListener("mousemove", onDrag);
		document.addEventListener("mouseup", stopDrag);

		return () => {
			document.removeEventListener("mousemove", onDrag);
			document.removeEventListener("mouseup", stopDrag);
		};
	}, [onDrag, stopDrag]);

	return (
		<div
			onClick={onColumnClick}
			className={
				classes.columnHeaderContentWrapper +
				(filterable ? " " + classes.columnHeaderFilterable : "")
			}
		>
			<ColumnHeaderContent
				headerName={props.column.headerName}
				enableResize={!props.column.isLocked}
				startDrag={startDrag}
				autoResize={autoResize}
				sort={sort}
				sortOrder={sortOrder}
				filterable={!!filterable}
				filter={filter}
				onFilterChange={internalOnFilterChange}
				columnType={props.column.type}
				filterData={props.column.filterData}
			/>
		</div>
	);
};

export default React.memo(ColumnHeader);
