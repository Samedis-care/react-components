import React, { useMemo } from "react";
import { CheckboxProps } from "@mui/material";
import { DataGridSelectAllCheckbox, useDataGridProps } from "../DataGrid";

export interface IDataGridContentSelectAllViewProps {
	/**
	 * Is currently checked (everything selected)
	 */
	checked: boolean;
	/**
	 * Is part of the rows selected? Shown as a dash, a click selects everything
	 */
	indeterminate: boolean;
	/**
	 * Is the select all button disabled?
	 */
	disabled: boolean;
	/**
	 * Is the selection still being loaded? (limited select all, see
	 * DataGridProps.limitSelectAll)
	 */
	busy: boolean;
	/**
	 * The accessible name, for a checkbox without a visible label
	 */
	label?: string;
	/**
	 * Update checked
	 * @param evt The change event, ignored
	 * @param newChecked New checked state
	 */
	onSelect: (evt: React.ChangeEvent, newChecked: boolean) => void;
}

const SelectAllView = (props: IDataGridContentSelectAllViewProps) => {
	const { classes } = useDataGridProps();
	const { busy, label } = props;
	const slotProps = useMemo(
		(): CheckboxProps["slotProps"] =>
			busy || label
				? { input: { "aria-busy": busy || undefined, "aria-label": label } }
				: undefined,
		[busy, label],
	);

	return (
		<DataGridSelectAllCheckbox
			className={classes?.selectAllCheckbox}
			checked={props.checked}
			indeterminate={props.indeterminate}
			onChange={props.onSelect}
			disabled={props.disabled}
			slotProps={slotProps}
		/>
	);
};

export default React.memo(SelectAllView);
