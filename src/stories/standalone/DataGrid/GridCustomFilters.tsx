import React, { useCallback } from "react";
import { IDataGridFilterBarProps } from "../../../standalone/DataGrid/Header/FilterBar";
import { Box, Grid, InputLabel } from "@material-ui/core";
import { BaseSelectorData, SingleSelect } from "../../../standalone";

interface CustomData {
	filter1?: string;
	filter2?: string;
	filter3?: string;
}

const options = ["Option 1", "Option 2", "Option 3"];

const CustomFilterEntry = (
	props: IDataGridFilterBarProps & { dataKey: keyof CustomData }
) => {
	const data = props.customData as CustomData;
	const { setCustomData, dataKey } = props;

	const setData = useCallback(
		(value: string) => {
			setCustomData((prev: CustomData) => ({
				...prev,
				[dataKey]: value,
			}));
		},
		[setCustomData, dataKey]
	);

	return (
		<>
			{props.inDialog && <InputLabel>{dataKey}</InputLabel>}
			<SingleSelect
				autocompleteId={dataKey + (props.inDialog ? "-dialog" : "")}
				disableSearch
				onLoad={(query: string) =>
					options
						.filter((option) =>
							option.toLowerCase().includes(query.toLowerCase())
						)
						.map(
							(option): BaseSelectorData => ({
								value: option,
								label: option,
							})
						)
				}
				onSelect={(selected: BaseSelectorData | null) =>
					setData(selected?.value || "")
				}
				selected={
					data[dataKey]
						? ({
								value: data[dataKey],
								label: data[dataKey],
						  } as BaseSelectorData)
						: null
				}
			/>
		</>
	);
};

const GridCustomFilters = (props: IDataGridFilterBarProps) => {
	return (
		<>
			<Grid item xs>
				<Box mt={1}>
					<CustomFilterEntry {...props} dataKey={"filter1"} />
				</Box>
			</Grid>
			<Grid item xs>
				<Box mt={1}>
					<CustomFilterEntry {...props} dataKey={"filter2"} />
				</Box>
			</Grid>
			<Grid item xs>
				<Box mt={1}>
					<CustomFilterEntry {...props} dataKey={"filter3"} />
				</Box>
			</Grid>
		</>
	);
};

export default React.memo(GridCustomFilters);
