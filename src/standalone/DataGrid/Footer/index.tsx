import React from "react";
import { Grid } from "@material-ui/core";
import Pagination from "./Pagination";
import StatusBar from "./DataActionBar";

const Footer = () => {
	return (
		<Grid container justify={"space-between"} wrap={"nowrap"}>
			<Grid item>
				<StatusBar />
			</Grid>
			<Grid item>
				<Pagination />
			</Grid>
		</Grid>
	);
};

export default React.memo(Footer);
