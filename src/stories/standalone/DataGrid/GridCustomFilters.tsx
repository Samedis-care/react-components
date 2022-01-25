import React from "react";
import { IDataGridFilterBarProps } from "../../../standalone/DataGrid/Header/FilterBar";
import { Grid } from "@material-ui/core";
import { GridSingleSelectFilter } from "../../../standalone";

const options = ["Option 1", "Option 2", "Option 3"];

const GridCustomFilters = (props: IDataGridFilterBarProps) => {
	const { customData, setCustomData, inDialog } = props;
	return (
		<Grid container>
			{[1, 2, 3].map((filterId) => (
				<GridSingleSelectFilter
					key={filterId.toString()}
					label={`Filter ${filterId}`}
					options={options.map((option) => ({ value: option, label: option }))}
					selected={customData[`filter${filterId}`] as string}
					defaultSelection={""}
					onSelect={(selected) => {
						setCustomData((old) => ({
							...old,
							[`filter${filterId}`]: selected,
						}));
					}}
					dialog={inDialog}
					autocompleteId={`filter${filterId}`}
				/>
			))}
		</Grid>
	);
};

export default React.memo(GridCustomFilters);
