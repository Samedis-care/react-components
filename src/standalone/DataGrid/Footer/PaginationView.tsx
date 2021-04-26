import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@material-ui/core";
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
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.only("xs"));
	const { t } = useTranslation(undefined, { i18n });

	const total = props.rowsTotal;
	const filtered = props.rowsFiltered ?? 0;
	const showFiltered =
		props.rowsFiltered !== null && props.rowsFiltered !== props.rowsTotal;
	const text = isMobile
		? showFiltered
			? `#${filtered}/${total}`
			: `#${total}`
		: `${
				showFiltered
					? `${t("standalone.data-grid.footer.filtered")} ${filtered} `
					: ""
		  }${t("standalone.data-grid.footer.total")} ${total}`;

	return (
		<Box mx={2}>
			<Typography className={classes.paginationText}>{text}</Typography>
		</Box>
	);
};

export default React.memo(PaginationView);
