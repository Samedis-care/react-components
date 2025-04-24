import React, { useCallback } from "react";
import { Grid2 as Grid, Switch, Typography } from "@mui/material";
import type { FilterComboType } from "./FilterEntry";

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
					<Grid>AND</Grid>
					<Grid>
						<Switch checked={value === "or"} onChange={handleChange} />
					</Grid>
					<Grid>OR</Grid>
				</Grid>
			</Typography>
		</Grid>
	);
};

export default React.memo(FilterCombinator);
