import React from "react";
import { Box, Typography } from "@material-ui/core";
import i18n from "../../../i18n";
import { useTranslation } from "react-i18next";
import { useDataGridStyles } from "../DataGrid";

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
	const classes = useDataGridStyles();
	const { t } = useTranslation(undefined, { i18n });

	return (
		<Box mx={2}>
			<Typography className={classes.paginationText}>
				{props.rowsFiltered !== null &&
					props.rowsFiltered !== props.rowsTotal &&
					`${t("standalone.data-grid.footer.filtered")} ${
						props.rowsFiltered
					}`}{" "}
				{t("standalone.data-grid.footer.total") || ""} {props.rowsTotal}
			</Typography>
		</Box>
	);
};

export default React.memo(PaginationView);
