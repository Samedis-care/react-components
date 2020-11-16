import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { useTheme } from "@material-ui/core";
import { measureText } from "../../../utils";
import { DataGridRootRefContext, IDataGridColumnDef } from "../index";
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

const HEADER_PADDING = 32; // px

const ColumnHeader = (props: IDataGridContentColumnHeaderProps) => {
	const {
		column,
		filter,
		onFilterChange,
		sort,
		onSortChange,
		sortOrder,
	} = props;
	const { field, sortable, filterable } = column;
	const gridRoot = useContext(DataGridRootRefContext);
	if (!gridRoot) throw new Error("DataGrid State context missing");
	const theme = useTheme();
	const headerRef = useRef<HTMLTableHeaderCellElement>();
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
			const curWidth = headerRef.current?.clientWidth;

			setWidth((prevState) =>
				move < 0 && curWidth && curWidth - HEADER_PADDING - 10 > prevState // prevent resizing beyond min width
					? prevState
					: prevState + move
			);
		},
		[dragging, setWidth]
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

		setWidth(width);
	}, [field, gridRoot, setWidth]);

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
			autoResize={autoResize}
			sort={sort}
			sortOrder={sortOrder}
			filterable={!!filterable}
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
					width: width,
					minWidth: width,
					zIndex: 1002,
				}}
				ref={headerRef}
			>
				{content()}
			</FixedCell>
		);
	} else {
		return (
			<StickyHeaderCell
				onClick={onColumnClick}
				style={{
					width: width,
					minWidth: width,
					zIndex: 1000,
				}}
				ref={headerRef}
			>
				{content()}
			</StickyHeaderCell>
		);
	}
};

export default React.memo(ColumnHeader);
