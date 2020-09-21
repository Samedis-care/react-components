import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@material-ui/core";
import { measureText } from "../../../utils";
import { IDataGridColumnDef } from "../index";
import FixedCell from "./FixedCell";
import { StickyHeaderCell } from "./CustomCells";
import ColumnHeaderContent from "./ColumnHeaderContent";
import { IFilterDef } from "./FilterEntry";

export interface IDataGridContentColumnHeaderProps {
	/**
	 * The column definition
	 */
	column: IDataGridColumnDef;
	/**
	 * The currently applied filter
	 */
	filter?: IFilterDef;
	/**
	 * Updates filter
	 * @param field The column definition field field
	 * @param value The new filter
	 */
	onFilterChange: (field: string, value: IFilterDef) => void;
	/**
	 * The currently applied sort
	 */
	sort: -1 | 0 | 1;
	/**
	 * The current sort priority (lower = higher priority)
	 */
	sortOrder: number | undefined;
	/**
	 * Updates sort
	 * @param field The column definition field field
	 * @param newSort The new sort value
	 */
	onSortChange: (field: string, newSort: -1 | 0 | 1) => void;
}

const ColumnHeader = (props: IDataGridContentColumnHeaderProps) => {
	const {
		column,
		filter,
		onFilterChange,
		sort,
		onSortChange,
		sortOrder,
	} = props;
	const { field } = column;
	const theme = useTheme();
	const [width, setWidth] = useState<number>(
		() =>
			measureText(
				theme.typography.body1.font || "16px Roboto, sans-serif",
				props.column.headerName
			).width + 100
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
	const onColumnClick = useCallback(() => {
		if (sort === 0) onSortChange(field, 1);
		else if (sort === 1) onSortChange(field, -1);
		else if (sort === -1) onSortChange(field, 0);
	}, [field, sort, onSortChange]);
	const internalOnFilterChange = useCallback(
		(newFilter: IFilterDef) => onFilterChange(field, newFilter),
		[field, onFilterChange]
	);

	useEffect(() => {
		document.addEventListener("mousemove", onDrag);
		document.addEventListener("mouseup", stopDrag);

		return () => {
			document.removeEventListener("mousemove", onDrag);
			document.addEventListener("mouseup", stopDrag);
		};
	}, [onDrag, stopDrag]);

	const content = () => (
		<ColumnHeaderContent
			headerName={props.column.headerName}
			enableResize={!props.column.isLocked}
			startDrag={startDrag}
			sort={sort}
			sortOrder={sortOrder}
			filter={filter}
			onFilterChange={internalOnFilterChange}
			columnType={props.column.type}
		/>
	);

	if (props.column.isLocked) {
		return (
			<FixedCell
				cellComponent={StickyHeaderCell}
				onClick={onColumnClick}
				key={column.fixedColumnKey}
				style={{
					minWidth: width,
					zIndex: 1002,
				}}
			>
				{content()}
			</FixedCell>
		);
	} else {
		return (
			<StickyHeaderCell
				onClick={onColumnClick}
				style={{
					minWidth: width,
					zIndex: 1000,
				}}
			>
				{content()}
			</StickyHeaderCell>
		);
	}
};

export default React.memo(ColumnHeader);
