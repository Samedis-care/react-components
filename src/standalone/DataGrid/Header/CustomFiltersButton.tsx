import React from "react";
import { Button, ButtonProps, Grid } from "@material-ui/core";
import { AppsIcon } from "../../Icons";
import useCCTranslations from "../../../utils/useCCTranslations";

const CustomFiltersButton = (props: Omit<ButtonProps, "outlined">) => {
	const { t } = useCCTranslations();
	return (
		<Button {...props} variant={"outlined"}>
			<Grid
				container
				spacing={2}
				wrap={"nowrap"}
				justify={"space-evenly"}
				alignItems={"center"}
			>
				<Grid item>
					{t("standalone.data-grid.header.custom-filter-button")}
				</Grid>
				<Grid item>
					<AppsIcon color={"primary"} />
				</Grid>
			</Grid>
		</Button>
	);
};

export default React.memo(CustomFiltersButton);
