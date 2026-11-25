import React from "react";
import { styled, useMediaQuery, useTheme } from "@mui/material";
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

/**
 * Holds the count, centred in the footer's height, 16px (8px on phones) from
 * the footer's end and from the action bar. A count that takes two lines (on
 * phones, see PaginationView) keeps them at the footer's end.
 */
const PaginationRoot = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	textAlign: "end",
	margin: theme.spacing(0, 2),
	[theme.breakpoints.only("xs")]: {
		margin: theme.spacing(0, 1),
	},
}));

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
			? // may break after the slash where the footer is short of room
				[`#${filtered}/`, <wbr key={"break"} />, total]
			: `#${total}`
		: showFiltered
			? t("standalone.data-grid.footer.counts-filtered", {
					FILTERED: filtered,
					TOTAL: total,
				})
			: t("standalone.data-grid.footer.counts", { TOTAL: total });

	return (
		<PaginationRoot>
			<DataGridPaginationText className={classes?.paginationText}>
				{text}
			</DataGridPaginationText>
		</PaginationRoot>
	);
};

export default React.memo(PaginationView);
