import React from "react";
import { Grid2 as Grid } from "@mui/material";
import Pagination from "./Pagination";
import StatusBar from "./DataActionBar";

const Footer = () => {
	return (
		<Grid container justifyContent={"space-between"} wrap={"nowrap"}>
			<Grid>
				<StatusBar />
			</Grid>
			<Grid>
				<Pagination />
			</Grid>
		</Grid>
	);
};

export default React.memo(Footer);
