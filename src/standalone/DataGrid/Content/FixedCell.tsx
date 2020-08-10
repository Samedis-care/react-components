import React, { useEffect, useRef, useState } from "react";
import { FixedDataGridCell } from "./CustomCells";
import { TableCellProps } from "@material-ui/core";

export interface IDataGridFixedCellProps extends TableCellProps {
	children: React.ReactNode;
	cellComponent?: React.ComponentType<TableCellProps>;
}

export default React.memo((props: IDataGridFixedCellProps) => {
	const CellComponent = props.cellComponent || FixedDataGridCell;

	const cellRef = useRef<typeof HTMLTableDataCellElement>();
	const [calcPos, setCalcPos] = useState(false);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (cellRef.current) {
			const ref = (cellRef.current as unknown) as HTMLTableCellElement;

			if (ref.style.left) {
				return;
			}

			if (!calcPos) {
				ref.style.left = "";
				ref.style.position = "";

				setCalcPos(true);
			} else {
				ref.style.left = `${ref.offsetLeft}px`;
			}
		}
	});

	return <CellComponent ref={cellRef} {...props} />;
});
