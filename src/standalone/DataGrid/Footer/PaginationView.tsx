import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { DataGridPaginationText, useDataGridProps } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import getCurrentLocale from "../../../utils/getCurrentLocale";

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
	const { classes } = useDataGridProps();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.only("xs"));
	const { t, i18n } = useCCTranslations();
	const locale = getCurrentLocale(i18n);

	// digits grouped as the language groups them: 12,345 (en), 12.345 (de)
	const total = props.rowsTotal.toLocaleString(locale);
	const filtered = (props.rowsFiltered ?? 0).toLocaleString(locale);
	const showFiltered =
		props.rowsFiltered !== null && props.rowsFiltered !== props.rowsTotal;
	const text = isMobile
		? showFiltered
			? `#${filtered}/${total}`
			: `#${total}`
		: showFiltered
			? t("standalone.data-grid.footer.counts-filtered", {
					FILTERED: filtered,
					TOTAL: total,
				})
			: t("standalone.data-grid.footer.counts", { TOTAL: total });

	return (
		<Box sx={{ mx: 2 }}>
			<DataGridPaginationText className={classes?.paginationText}>
				{text}
			</DataGridPaginationText>
		</Box>
	);
};

export default React.memo(PaginationView);
