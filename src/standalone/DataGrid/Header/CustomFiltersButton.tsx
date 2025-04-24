import React from "react";
import { Button, ButtonProps, Grid2 as Grid } from "@mui/material";
import useCCTranslations from "../../../utils/useCCTranslations";
import { DataGridCustomFilterIcon, useDataGridProps } from "../DataGrid";
import combineClassNames from "../../../utils/combineClassNames";
import { useCustomFilterActiveContext } from "./FilterBar";

const CustomFiltersButton = (props: Omit<ButtonProps, "outlined">) => {
	const { classes } = useDataGridProps();
	const customDataChanged = useCustomFilterActiveContext()[0] > 0;
	const { t } = useCCTranslations();
	return (
		<Button {...props} variant={"outlined"}>
			<Grid
				container
				spacing={2}
				wrap={"nowrap"}
				justifyContent={"space-evenly"}
				alignItems={"center"}
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
