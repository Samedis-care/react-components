import React from "react";
import { Box, Button, Divider, Grid } from "@mui/material";
import {
	DataGridContentOverlayClosed,
	DataGridContentOverlayPaper,
	DataGridCustomFilterContainer,
	DataGridCustomFilterDialogTitle,
	useDataGridProps,
} from "../DataGrid";
import { IDataGridFilterBarProps } from "../Header/FilterBar";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface DataGridCustomFilterDialogProps
	extends Omit<IDataGridFilterBarProps, "inDialog"> {
	/**
	 * Callback to close custom filter pop-over
	 */
	closeFilterDialog: () => void;
	/**
	 * The component to render
	 */
	customFilters: React.ComponentType<IDataGridFilterBarProps>;
}

const FilterDialog = (props: DataGridCustomFilterDialogProps) => {
	const { classes } = useDataGridProps();
	const { t } = useCCTranslations();
	const { customFilters: Filters, customData, setCustomData } = props;

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
				justifyContent={"space-between"}
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
				<Grid container justifyContent={"flex-end"}>
					<Grid>
						<Box m={2}>
							<Button onClick={props.closeFilterDialog} variant={"contained"}>
								{t("standalone.data-grid.settings.close") || ""}
							</Button>
						</Box>
					</Grid>
				</Grid>
			</DataGridContentOverlayClosed>
		</DataGridContentOverlayPaper>
	);
};

export default React.memo(FilterDialog);
