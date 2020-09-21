import React from "react";
import { Grid } from "@material-ui/core";
import Pagination from "./Pagination";
import StatusBar, { IDataGridStatusBarProps } from "./StatusBar";

export interface IDataGridFooterProps {
	/**
	 * The status bar component for rendering custom status messages
	 */
	statusBar?: React.ComponentType<IDataGridStatusBarProps>;
}

const Footer = () => {
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
};

export default React.memo(Footer);
