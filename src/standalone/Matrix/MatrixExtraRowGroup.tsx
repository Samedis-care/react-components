import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ccI18n from "../../i18n";
import { useMatrixConfig } from "./MatrixGridContext";
import MatrixContents from "./MatrixContents";
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
 * The grid never suspended, and the one text it translates is only heard:
 * while the translations load it uses the English default, then re-renders
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };

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
	const { t } = useTranslation("translation", TRANSLATION_OPTIONS);
	const addName = t("standalone.matrix.extra-cell-add", {
		defaultValue: "Add",
	});
	const [activeKey, setActiveKey] = useState<string | null>(null);
	// True from an arrow key until the cell it moved to took the focus (that
	// cell clears it through focusColumn), so the row never takes the focus
	// unasked when it renders or its cells mount again.
	const [pullFocus, setPullFocus] = useState(false);
	// The remembered cell only while its column is on screen: after the
	// columns change under it (paging to another range), the row falls back
	// to its first column rather than having no tab stop at all. The key is
	// kept, so the cell is the tab stop again if its column comes back.
	const remembered = useMemo(
		() =>
			activeKey !== null && columns.some((column) => column.key === activeKey)
				? activeKey
				: null,
		[activeKey, columns],
	);
	const active = remembered ?? columns[0]?.key;

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
		<MatrixContents role={"row"}>
			<MatrixExtraRowHeader extraRow={props.extraRow} />
			{columns.map((column) => (
				<MatrixExtraRowCell
					key={column.key}
					extraRow={props.extraRow}
					column={column}
					tabStop={column.key === active}
					// only the cell an arrow key moved to takes the focus, never
					// the fallback
					pullFocus={pullFocus && column.key === remembered}
					onNavigate={navigate}
					onFocusColumn={focusColumn}
					addName={addName}
				/>
			))}
		</MatrixContents>
	);
};

export default React.memo(MatrixExtraRowGroup);
