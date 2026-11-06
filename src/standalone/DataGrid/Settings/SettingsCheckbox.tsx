import React, { ChangeEvent, useMemo } from "react";
import { Checkbox } from "@mui/material";

export interface IDataGridSettingsCheckboxProps {
	/**
	 * The column's field: the checkbox's value, which the change handler reads
	 * from the event's target
	 */
	field: string;
	/**
	 * Is the checkbox ticked?
	 */
	checked: boolean;
	/**
	 * Is the checkbox disabled? Give describedBy a reason then.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Called when the user ticks or unticks the checkbox
	 * @param evt The change event; its target's value is field
	 */
	onChange: (evt: ChangeEvent<HTMLInputElement>) => void;
	/**
	 * The ids of the elements that name the checkbox, space separated: the
	 * table's column header ("Visible", "Pin") and the row's header (the
	 * column's name)
	 */
	labelledBy: string;
	/**
	 * The id of the element that says why the checkbox is disabled, or
	 * undefined for none
	 */
	describedBy?: string;
}

/**
 * A "Visible" or "Pin" checkbox of the column settings table, named by its
 * table column and row headers
 */
const SettingsCheckbox = (props: IDataGridSettingsCheckboxProps) => {
	const { field, checked, disabled, onChange, labelledBy, describedBy } = props;
	const slotProps = useMemo(
		() => ({
			input: {
				"aria-labelledby": labelledBy,
				"aria-describedby": describedBy,
			},
		}),
		[labelledBy, describedBy],
	);
	return (
		<Checkbox
			checked={checked}
			disabled={disabled}
			onChange={onChange}
			value={field}
			slotProps={slotProps}
		/>
	);
};

export default React.memo(SettingsCheckbox);
