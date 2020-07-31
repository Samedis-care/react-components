import React from "react";
import { Grid } from "@material-ui/core";
import Search from "./Search";
import ActionBar from "./ActionBar";
import FilterBar from "./FilterBar";

export type IDataGridHeaderProps = {};

export default React.memo((props: IDataGridHeaderProps) => {
	return (
		<Grid container justify={"space-between"}>
			<Grid item>
				<Search />
			</Grid>
			<Grid item>
				<FilterBar />
			</Grid>
			<Grid item>
				<ActionBar />
			</Grid>
		</Grid>
	);
});
