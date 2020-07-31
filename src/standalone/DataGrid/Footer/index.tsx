import React from "react";
import { Grid } from "@material-ui/core";
import Pagination from "./Pagination";
import StatusBar from "./StatusBar";

export type IDataGridFooterProps = {};

export default React.memo((props: IDataGridFooterProps) => {
	return (
		<Grid container justify={"space-between"}>
			<Grid item>
				<StatusBar />
			</Grid>
			<Grid item>
				<Pagination />
			</Grid>
		</Grid>
	);
});
