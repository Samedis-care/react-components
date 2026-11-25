import React from "react";
import { Button, ButtonProps, Grid } from "@mui/material";
import useCCTranslations from "../../../utils/useCCTranslations";
import {
	DataGridCustomFilterIcon,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import combineClassNames from "../../../utils/combineClassNames";
import { useDataGridCustomFiltersActive } from "../DataGridUtils";

/**
 * The "Filter" button that replaces the filter bar in dialog mode (while the
 * bar is narrower than enableFilterDialogWidth) and opens or closes the panel
 * with the bar's filters. It shows
 * `standalone.data-grid.header.custom-filter-button` ("Filter"). Its accessible
 * name, `standalone.data-grid.header.custom-filter-button-label` ("Filter
 * selection"), starts with that text and sets it apart from the "Filter"
 * buttons of the column headers. `aria-expanded` tells whether the panel is
 * open. Only inside a DataGrid.
 * @param props Props of the MUI Button; variant is always "outlined". An
 *              `aria-label` or `aria-expanded` given here replaces the
 *              button's own.
 */
const CustomFiltersButton = (props: Omit<ButtonProps, "outlined">) => {
	const { classes } = useDataGridProps();
	const [{ showFilterDialog }] = useDataGridState();
	const customDataChanged = useDataGridCustomFiltersActive();
	const { t } = useCCTranslations();
	return (
		<Button
			aria-label={t("standalone.data-grid.header.custom-filter-button-label")}
			aria-expanded={showFilterDialog}
			{...props}
			variant={"outlined"}
		>
			<Grid
				container
				spacing={2}
				wrap={"nowrap"}
				sx={{ justifyContent: "space-evenly", alignItems: "center" }}
			>
				<Grid>{t("standalone.data-grid.header.custom-filter-button")}</Grid>
				<Grid>
					<DataGridCustomFilterIcon
						className={combineClassNames([
							classes?.customFilterIcon,
							customDataChanged && "CcDataGrid-customFilterActiveIcon",
						])}
					/>
				</Grid>
			</Grid>
		</Button>
	);
};

export default React.memo(CustomFiltersButton);
