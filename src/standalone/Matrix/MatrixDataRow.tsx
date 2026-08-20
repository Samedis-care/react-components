import React from "react";
import { useMatrixConfig } from "./MatrixGridContext";
import MatrixRowHeader from "./MatrixRowHeader";
import MatrixBodyCell from "./MatrixBodyCell";
import { MatrixRow } from "./types";

export interface MatrixDataRowProps<TCell> {
	/**
	 * The row to render: its sticky header plus one cell per column
	 */
	row: MatrixRow<TCell>;
}

/**
 * One data row of the grid.
 * @remarks Memoized on the row alone — everything else comes from the config
 * context — so a data update re-renders the rows that changed and no others.
 */
const MatrixDataRow = <TCell,>(props: MatrixDataRowProps<TCell>) => {
	const { columns } = useMatrixConfig<TCell>();
	return (
		<React.Fragment>
			<MatrixRowHeader row={props.row} />
			{columns.map((column, columnIndex) => (
				<MatrixBodyCell
					key={column.key}
					row={props.row}
					column={column}
					columnIndex={columnIndex}
				/>
			))}
		</React.Fragment>
	);
};

export default React.memo(MatrixDataRow) as typeof MatrixDataRow;
