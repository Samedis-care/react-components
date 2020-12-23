import React, { useCallback, useEffect, useRef, useState } from "react";
import { measureText } from "../../../utils";
import {
	IDataGridColumnDef,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridRootRef,
} from "../index";
import ColumnHeaderContent from "./ColumnHeaderContent";
import { IFilterDef } from "./FilterEntry";
import { makeStyles } from "@material-ui/core/styles";

export interface IDataGridContentColumnHeaderProps {
	/**
	 * The column definition
	 */
	column: IDataGridColumnDef;
}

export const HEADER_PADDING = 32; // px

const useStyles = makeStyles((theme) => ({
	contentWrapper: {
		width: "100%",
		minWidth: "100%",
		zIndex: 1000,
	},
	filterableStyles: {
		color: theme.palette.primary.main,
	},
}));

const ColumnHeader = (props: IDataGridContentColumnHeaderProps) => {
	const { column } = props;
	const { field, sortable, filterable } = column;
	const gridRoot = useDataGridRootRef();
	const [columnState, setColumnState] = useDataGridColumnState();
	const { sort, sortOrder, filter } = columnState[field];
	const [, setColumnWidthState] = useDataGridColumnsWidthState();
	const headerRef = useRef<HTMLDivElement>(null);
	const [dragging, setDragging] = useState(false);
	const classes = useStyles();

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
			const curWidth = headerRef.current?.clientWidth;

			setColumnWidthState((prevState) => ({
				...prevState,
				[field]:
					move < 0 &&
					curWidth &&
					curWidth - HEADER_PADDING - 10 > prevState[field] // prevent resizing beyond min width
						? prevState[field]
						: prevState[field] + move,
			}));
		},
		[dragging, field, setColumnWidthState]
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
			const entryWidth =
				measureText(
					getComputedStyle(entry).font,
					(entry as HTMLElement).innerText
				).width + HEADER_PADDING;
			width = Math.max(width, entryWidth);
		});
		setColumnState((prevState) => ({
			...prevState,
			[field]: {
				...prevState[field],
				width: width,
			},
		}));
	}, [field, gridRoot, setColumnState]);

	useEffect(() => {
		document.addEventListener("mousemove", onDrag);
		document.addEventListener("mouseup", stopDrag);

		return () => {
			document.removeEventListener("mousemove", onDrag);
			document.addEventListener("mouseup", stopDrag);
		};
	}, [onDrag, stopDrag]);

	return (
		<div
			onClick={onColumnClick}
			className={
				classes.contentWrapper +
				(filterable ? " " + classes.filterableStyles : "")
			}
			ref={headerRef}
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
