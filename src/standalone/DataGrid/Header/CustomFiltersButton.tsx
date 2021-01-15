import React from "react";
import { Button, ButtonProps, Grid } from "@material-ui/core";
import { AppsIcon } from "../../Icons";
import ccI18n from "../../../i18n";

const CustomFiltersButton = (props: Omit<ButtonProps, "outlined">) => {
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
					{ccI18n.t("standalone.data-grid.header.custom-filter-button")}
				</Grid>
				<Grid item>
					<AppsIcon color={"primary"} />
				</Grid>
			</Grid>
		</Button>
	);
};

export default React.memo(CustomFiltersButton);
