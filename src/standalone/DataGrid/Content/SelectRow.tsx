import React, { useMemo } from "react";
import {
	DataGridProps,
	DataGridRowData,
	IDataGridColumnDef,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import SelectRowView from "./SelectRowView";

export interface IDataGridContentSelectRowProps {
	/**
	 * The row record
	 */
	record: DataGridRowData;
	/**
	 * The visible columns, in the order they are shown
	 */
	columns: IDataGridColumnDef[];
}

const xor = (v1: boolean, v2: boolean): boolean => {
	return v1 ? !v2 : v2;
};

const isSelectedHookDefault = (selected: boolean): boolean => selected;
export const isSelected = (
	selectAll: boolean,
	selectedIds: string[],
	record?: Record<string, unknown>,
	isSelectedHook?: DataGridProps["isSelected"],
): boolean => {
	if (!record) return false;
	const result = xor(selectAll, selectedIds.includes(record.id as string));
	return (isSelectedHook ?? isSelectedHookDefault)(result, record);
};

/** The text in a React node: its strings and numbers, children included */
const textOfNode = (node: unknown): string => {
	if (typeof node === "string") return node;
	if (typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textOfNode).join("");
	if (React.isValidElement<{ children?: unknown }>(node))
		return textOfNode(node.props.children);
	return "";
};

/** The text a cell shows for a row's value (see Cell) */
const textOfValue = (value: DataGridRowData[string]): string =>
	(value &&
	typeof value === "object" &&
	!React.isValidElement(value) &&
	"toString" in value
		? value.toString()
		: textOfNode(value)
	)
		.replace(/\s+/g, " ")
		.trim();

const TEXT_TYPES: IDataGridColumnDef["type"][] = [
	"string",
	"localized-string",
	"combined-string",
];

/**
 * The default of DataGridProps.getRowLabel: the text of the first visible
 * column that shows text, text columns first
 */
const getRowLabelDefault = (
	record: DataGridRowData,
	columns: IDataGridColumnDef[],
): string => {
	let fallback = "";
	for (const column of columns) {
		const text = textOfValue(record[column.field]);
		if (!text) continue;
		if (TEXT_TYPES.includes(column.type)) return text;
		fallback ||= text;
	}
	return fallback;
};

const SelectRow = (props: IDataGridContentSelectRowProps) => {
	const { record, columns } = props;
	const [state] = useDataGridState();
	const {
		isSelected: isSelectedHook,
		canSelectRow,
		customSelectionControl,
		getRowLabel,
	} = useDataGridProps();
	const SelectRowControl = customSelectionControl || SelectRowView;
	const rowLabel = useMemo(
		() =>
			getRowLabel ? getRowLabel(record) : getRowLabelDefault(record, columns),
		[getRowLabel, record, columns],
	);

	return (
		<SelectRowControl
			checked={isSelected(
				state.selectAll,
				state.selectedRows,
				record,
				isSelectedHook,
			)}
			disabled={canSelectRow ? !canSelectRow(record) : false}
			id={record.id}
			rowLabel={rowLabel}
		/>
	);
};

export default React.memo(SelectRow);
