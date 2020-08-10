import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@material-ui/core";
import { measureText } from "../../../utils";
import { IDataGridColumnDef } from "../index";
import FixedCell from "./FixedCell";
import { StickyHeaderCell } from "./CustomCells";
import ColumnHeaderContent from "./ColumnHeaderContent";

export interface IDataGridContentColumnHeaderProps {
	column: IDataGridColumnDef;
}

export default React.memo((props: IDataGridContentColumnHeaderProps) => {
	const theme = useTheme();
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

	const content = () => (
		<ColumnHeaderContent
			headerName={props.column.headerName}
			disableResize={!props.column.isLocked}
			startDrag={startDrag}
			// TODO: use state
			sort={1}
			filter={undefined}
			onFilterChange={console.log}
		/>
	);

	if (props.column.isLocked) {
		return (
			<FixedCell
				cellComponent={StickyHeaderCell}
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
				style={{
					minWidth: width,
					zIndex: 1000,
				}}
			>
				{content()}
			</StickyHeaderCell>
		);
	}
});
