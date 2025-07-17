import React, { useCallback } from "react";
import { Grid, Switch, Typography } from "@mui/material";
import type { FilterComboType } from "./FilterEntry";
import useCCTranslations from "../../../utils/useCCTranslations";

interface IProps {
	/**
	 * The current filter combination type
	 */
	value: FilterComboType;
	/**
	 * Sets the filter combination type
	 * @param value The new type
	 */
	onChange: (value: FilterComboType) => void;
}

const FilterCombinator = (props: IProps) => {
	const { value, onChange } = props;
	const { t } = useCCTranslations();

	const handleChange = useCallback(
		(_evt: React.ChangeEvent, newValue: boolean) => {
			onChange(newValue ? "or" : "and");
		},
		[onChange],
	);

	return (
		<Grid size={12}>
			<Typography component="div">
				<Grid
					component="label"
					container
					justifyContent={"space-between"}
					alignItems="center"
					spacing={1}
				>
					<Grid>
						{t("standalone.data-grid.content.filter-combination.and")}
					</Grid>
					<Grid>
						<Switch checked={value === "or"} onChange={handleChange} />
					</Grid>
					<Grid>{t("standalone.data-grid.content.filter-combination.or")}</Grid>
				</Grid>
			</Typography>
		</Grid>
	);
};

export default React.memo(FilterCombinator);
