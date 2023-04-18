import React, { useCallback } from "react";
import { Grid, Switch, Typography } from "@mui/material";
import { FilterComboType } from "./FilterEntry";

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
		[onChange]
	);

	return (
		<Grid item xs={12}>
			<Typography component="div">
				<Grid
					component="label"
					container
					justifyContent={"space-between"}
					alignItems="center"
					spacing={1}
				>
					<Grid item>AND</Grid>
					<Grid item>
						<Switch checked={value === "or"} onChange={handleChange} />
					</Grid>
					<Grid item>OR</Grid>
				</Grid>
			</Typography>
		</Grid>
	);
};

export default React.memo(FilterCombinator);
