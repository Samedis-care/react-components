import React, { useMemo } from "react";
import { CheckboxProps } from "@mui/material";
import { DataGridSelectCheckbox, useDataGridProps } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface IDataGridContentSelectRowViewProps {
	/**
	 * Is currently checked?
	 */
	checked: boolean;
	/**
	 * The row record ID
	 */
	id: string;
	/**
	 * Is the control disabled?
	 */
	disabled: boolean;
	/**
	 * The text that identifies the row (DataGridProps.getRowLabel), e.g. a
	 * person's name, to name the control after its row: "Select Carol Jones".
	 * An empty string if the row has none.
	 */
	rowLabel: string;
}

const SelectRowView = (props: IDataGridContentSelectRowViewProps) => {
	const { classes } = useDataGridProps();
	const { t } = useCCTranslations();
	const { rowLabel } = props;
	const slotProps = useMemo(
		(): CheckboxProps["slotProps"] => ({
			input: {
				"aria-label": rowLabel
					? t("standalone.data-grid.content.select-row", { ROW: rowLabel })
					: t("standalone.data-grid.content.select-row-fallback"),
			},
		}),
		[rowLabel, t],
	);

	return (
		<DataGridSelectCheckbox
			disabled={props.disabled}
			checked={props.checked}
			className={classes?.selectCheckbox}
			slotProps={slotProps}
		/>
	);
};

export default React.memo(SelectRowView);
