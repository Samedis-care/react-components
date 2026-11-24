import React from "react";
import { Button, Divider, Grid } from "@mui/material";
import {
	DataGridContentOverlayClosed,
	DataGridContentOverlayPaper,
	DataGridCustomFilterContainer,
	DataGridCustomFilterDialogTitle,
	useDataGridProps,
} from "../DataGrid";
import { IDataGridFilterBarProps } from "../Header/FilterBar";
import useCCTranslations from "../../../utils/useCCTranslations";
import FilterDialogCount from "./FilterDialogCount";

export interface DataGridCustomFilterDialogProps extends Omit<
	IDataGridFilterBarProps,
	"inDialog"
> {
	/**
	 * Closes the panel ("Show results"). The picks are kept: they apply at
	 * once, as in the bar.
	 */
	closeFilterDialog: () => void;
	/**
	 * Sets the custom data back to DataGridProps.defaultCustomData ("Reset").
	 * The search and the column filters stay. Without it the panel has no
	 * "Reset" (DataGridProps.hideReset).
	 */
	resetCustomData?: () => void;
	/**
	 * The component to render
	 */
	customFilters: React.ComponentType<IDataGridFilterBarProps>;
}

// the footer: the row count, and the buttons at the end of the line
const FOOTER_SX = { alignItems: "center", justifyContent: "flex-end", m: 2 };
// fills the line, but is not squeezed: the buttons wrap below
const COUNT_SX = { flexGrow: 1 };
const BUTTONS_SX = { justifyContent: "flex-end" };

const FilterDialog = (props: DataGridCustomFilterDialogProps) => {
	const { classes } = useDataGridProps();
	const { t } = useCCTranslations();
	const {
		customFilters: Filters,
		customData,
		setCustomData,
		closeFilterDialog,
		resetCustomData,
	} = props;

	return (
		<DataGridContentOverlayPaper
			elevation={0}
			className={classes?.contentOverlayPaper}
		>
			<DataGridCustomFilterDialogTitle
				variant={"h6"}
				className={classes?.customFilterContainerHeader}
			>
				{t("standalone.data-grid.custom-filters.title") || ""}
			</DataGridCustomFilterDialogTitle>
			<Divider />
			<DataGridCustomFilterContainer
				sx={{ justifyContent: "space-between" }}
				spacing={2}
				container
				className={classes?.customFilterContainer}
			>
				<Filters
					customData={customData}
					setCustomData={setCustomData}
					inDialog
				/>
			</DataGridCustomFilterContainer>
			<DataGridContentOverlayClosed className={classes?.contentOverlayClosed}>
				<Divider />
				<Grid container spacing={1} sx={FOOTER_SX}>
					<Grid size={"auto"} sx={COUNT_SX}>
						<FilterDialogCount />
					</Grid>
					<Grid container spacing={1} sx={BUTTONS_SX}>
						{resetCustomData && (
							<Grid>
								<Button onClick={resetCustomData}>
									{t("standalone.data-grid.custom-filters.reset")}
								</Button>
							</Grid>
						)}
						<Grid>
							<Button onClick={closeFilterDialog} variant={"contained"}>
								{t("standalone.data-grid.custom-filters.show-results")}
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</DataGridContentOverlayClosed>
		</DataGridContentOverlayPaper>
	);
};

export default React.memo(FilterDialog);
