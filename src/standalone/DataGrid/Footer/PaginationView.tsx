import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import i18n from "../../../i18n";

const useStyles = makeStyles((theme) => ({
	text: {
		padding: "12px 0",
	},
	firstPageBtn: {
		paddingLeft: 0,
	},
	paginationBtn: {
		[theme.breakpoints.down("sm")]: {
			paddingLeft: 4,
			paddingRight: 4,
		},
	},
	vertDivWrapper: {
		height: "100%",
	},
}));

export interface IDataGridPaginationViewProps {
	/**
	 * The total amount of rows
	 */
	rowsTotal: number;
	/**
	 * The amount of rows shown
	 */
	rowsFiltered: number | null;
}

const PaginationView = (props: IDataGridPaginationViewProps) => {
	const classes = useStyles();

	return (
		<Box mx={2}>
			<Typography className={classes.text}>
				{props.rowsFiltered !== null &&
					props.rowsFiltered !== props.rowsTotal &&
					`${i18n.t("standalone.data-grid.footer.filtered")} ${
						props.rowsFiltered
					}`}{" "}
				{i18n.t("standalone.data-grid.footer.total") || ""} {props.rowsTotal}
			</Typography>
		</Box>
	);
};

export default React.memo(PaginationView);
