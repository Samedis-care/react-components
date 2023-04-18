import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useDataGridStyles } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	const { t } = useCCTranslations();

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
