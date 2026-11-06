import React, { useCallback } from "react";
import { Grid, styled, ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { FilterComboType } from "./FilterEntry";
import { useDataGridProps } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";

interface IProps {
	/**
	 * The current filter combination type: the button of that word is pressed
	 */
	value: FilterComboType;
	/**
	 * Called with "and" or "or" when the user picks the other word (a click on
	 * its button, or Space/Enter on it). Picking the pressed word again does not
	 * call it.
	 * @param value The new type
	 */
	onChange: (value: FilterComboType) => void;
}

const DataGridFilterCombinator = styled(ToggleButtonGroup, {
	name: "CcDataGrid",
	slot: "filterCombinator",
})({});

/**
 * The choice between AND and OR that joins two conditions of a column filter
 * chain (FilterEntry). It is a group of two toggle buttons named "Combine
 * conditions", of which one is pressed; a click on a word picks that word.
 * The group is one Tab stop: the arrow keys move the focus between the words,
 * and Space or Enter picks the focused one.
 * @internal
 */
const FilterCombinator = (props: IProps) => {
	const { value, onChange } = props;
	const { classes } = useDataGridProps();
	const { t } = useCCTranslations();

	const handleChange = useCallback(
		(_evt: React.MouseEvent<HTMLElement>, newValue: FilterComboType | null) => {
			// MUI reports a click on the pressed button as null; it stays pressed
			if (newValue === null) return;
			onChange(newValue);
		},
		[onChange],
	);

	return (
		<Grid size={12}>
			<DataGridFilterCombinator
				exclusive
				fullWidth
				size="small"
				aria-label={t("standalone.data-grid.content.filter-combination.label")}
				value={value}
				onChange={handleChange}
				className={classes?.filterCombinator}
			>
				<ToggleButton value="and">
					{t("standalone.data-grid.content.filter-combination.and")}
				</ToggleButton>
				<ToggleButton value="or">
					{t("standalone.data-grid.content.filter-combination.or")}
				</ToggleButton>
			</DataGridFilterCombinator>
		</Grid>
	);
};

export default React.memo(FilterCombinator);
