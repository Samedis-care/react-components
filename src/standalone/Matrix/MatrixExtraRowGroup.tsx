import React from "react";
import { useMatrixConfig } from "./MatrixGridContext";
import MatrixExtraRowHeader from "./MatrixExtraRowHeader";
import MatrixExtraRowCell from "./MatrixExtraRowCell";
import { MatrixExtraRow } from "./types";

export interface MatrixExtraRowGroupProps {
	/**
	 * The aggregate row to render: its sticky header plus one cell per column
	 */
	extraRow: MatrixExtraRow;
}

/**
 * One aggregate row of the grid.
 * @remarks Memoized on the row definition alone, like MatrixDataRow.
 */
const MatrixExtraRowGroup = (props: MatrixExtraRowGroupProps) => {
	const { columns } = useMatrixConfig<unknown>();
	return (
		<React.Fragment>
			<MatrixExtraRowHeader extraRow={props.extraRow} />
			{columns.map((column) => (
				<MatrixExtraRowCell
					key={column.key}
					extraRow={props.extraRow}
					column={column}
				/>
			))}
		</React.Fragment>
	);
};

export default React.memo(MatrixExtraRowGroup);
