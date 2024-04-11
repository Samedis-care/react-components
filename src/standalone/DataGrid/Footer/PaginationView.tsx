import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { DataGridPaginationText, useDataGridProps } from "../DataGrid";
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
	const { classes } = useDataGridProps();
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
			<DataGridPaginationText className={classes?.paginationText}>
				{text}
			</DataGridPaginationText>
		</Box>
	);
};

export default React.memo(PaginationView);
