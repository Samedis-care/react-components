import React, { useCallback, useState } from "react";
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
 *
 * Its cells are buttons, but only ONE of them is in the tab order at a time and
 * the arrow keys move between them (the roving tabindex a grid row wants): with
 * the documented 400 column cap, a tab stop per cell would mean tabbing 400
 * times to get past one row.
 * @remarks Memoized on the row definition alone, like MatrixDataRow.
 */
const MatrixExtraRowGroup = (props: MatrixExtraRowGroupProps) => {
	const { columns } = useMatrixConfig<unknown>();
	const [activeKey, setActiveKey] = useState<string | null>(null);
	// only true right after an arrow key, so the row does not steal the focus
	// when it renders
	const [pullFocus, setPullFocus] = useState(false);
	const active = activeKey ?? columns[0]?.key;

	const navigate = useCallback(
		(from: string, to: "previous" | "next" | "first" | "last") => {
			const index = columns.findIndex((column) => column.key === from);
			if (index < 0) return;
			const next =
				to === "first"
					? 0
					: to === "last"
						? columns.length - 1
						: to === "next"
							? Math.min(index + 1, columns.length - 1)
							: Math.max(index - 1, 0);
			setActiveKey(columns[next]?.key ?? null);
			setPullFocus(true);
		},
		[columns],
	);
	const focusColumn = useCallback((columnKey: string) => {
		setActiveKey(columnKey);
		setPullFocus(false);
	}, []);

	return (
		<React.Fragment>
			<MatrixExtraRowHeader extraRow={props.extraRow} />
			{columns.map((column) => (
				<MatrixExtraRowCell
					key={column.key}
					extraRow={props.extraRow}
					column={column}
					tabStop={column.key === active}
					pullFocus={pullFocus && column.key === active}
					onNavigate={navigate}
					onFocusColumn={focusColumn}
				/>
			))}
		</React.Fragment>
	);
};

export default React.memo(MatrixExtraRowGroup);
