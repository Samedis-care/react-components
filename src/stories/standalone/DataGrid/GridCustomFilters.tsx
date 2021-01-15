import React, { useCallback, useState } from "react";
import { IDataGridFilterBarProps } from "../../../standalone/DataGrid/Header/FilterBar";
import {
	Box,
	Grid,
	Hidden,
	List,
	ListItem,
	MenuItem,
	Select,
} from "@material-ui/core";
import PopupMenu from "../../../standalone/PopupMenu";
import CustomFiltersButton from "../../../standalone/DataGrid/Header/CustomFiltersButton";

interface CustomData {
	filter1?: string;
	filter2?: string;
	filter3?: string;
}

const CustomFilterEntry = (
	props: IDataGridFilterBarProps & { dataKey: keyof CustomData }
) => {
	const data = props.customData as CustomData;
	const { setCustomData, dataKey } = props;

	const setData = useCallback(
		(evt: React.ChangeEvent<{ name?: string; value: unknown }>) => {
			setCustomData((prev: CustomData) => ({
				...prev,
				[dataKey]: evt.target.value as string,
			}));
		},
		[setCustomData, dataKey]
	);

	return (
		<Select value={data[props.dataKey] || ""} onChange={setData} fullWidth>
			<MenuItem value={""}>No selection</MenuItem>
			<MenuItem value={"value1"}>Value 1</MenuItem>
			<MenuItem value={"value2"}>Value 2</MenuItem>
			<MenuItem value={"value3"}>Value 3</MenuItem>
		</Select>
	);
};

const GridCustomFilters = (props: IDataGridFilterBarProps) => {
	const [anchorEl, setAnchorEl] = useState<Element | null>(null);
	const openMenu = useCallback(
		(evt: React.MouseEvent) => {
			setAnchorEl(evt.currentTarget);
		},
		[setAnchorEl]
	);
	const closeMenu = useCallback(() => setAnchorEl(null), [setAnchorEl]);

	return (
		<>
			<Hidden mdUp>
				<Grid item>
					<CustomFiltersButton onClick={openMenu} />
				</Grid>
				<PopupMenu
					elevation={0}
					anchorEl={anchorEl}
					open={!!anchorEl}
					onClose={closeMenu}
				>
					<List>
						<ListItem>
							<CustomFilterEntry {...props} dataKey={"filter1"} />
						</ListItem>
						<ListItem>
							<CustomFilterEntry {...props} dataKey={"filter2"} />
						</ListItem>
						<ListItem>
							<CustomFilterEntry {...props} dataKey={"filter3"} />
						</ListItem>
					</List>
				</PopupMenu>
			</Hidden>
			<Hidden smDown>
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
			</Hidden>
		</>
	);
};

export default React.memo(GridCustomFilters);
