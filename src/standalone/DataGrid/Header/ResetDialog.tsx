import React, { useCallback } from "react";
import { Button, Dialog, DialogContent, Grid } from "@material-ui/core";
import useCCTranslations from "../../../utils/useCCTranslations";

/**
 * Reset button callbacks
 */
export interface ResetCallbacks {
	resetFilter: () => void;
	resetSort: () => void;
	resetColumn: () => void;
	resetWidth: () => void;
	resetAll: () => void;
}

export interface ResetDialogProps extends ResetCallbacks {
	/**
	 * Is the dialog open
	 */
	open: boolean;
	/**
	 * Callback for dialog close
	 */
	closeDialog: () => void;
}

const ResetDialog = (props: ResetDialogProps) => {
	const { t } = useCCTranslations();
	const {
		open,
		closeDialog,
		resetFilter,
		resetSort,
		resetColumn,
		resetWidth,
		resetAll,
	} = props;

	const resetFilterAndClose = useCallback(() => {
		resetFilter();
		closeDialog();
	}, [resetFilter, closeDialog]);
	const resetSortAndClose = useCallback(() => {
		resetSort();
		closeDialog();
	}, [resetSort, closeDialog]);
	const resetColumnAndClose = useCallback(() => {
		resetColumn();
		closeDialog();
	}, [resetColumn, closeDialog]);
	const resetWidthAndClose = useCallback(() => {
		resetWidth();
		closeDialog();
	}, [resetWidth, closeDialog]);
	const resetAllAndClose = useCallback(() => {
		resetAll();
		closeDialog();
	}, [resetAll, closeDialog]);

	return (
		<Dialog open={open} onClose={closeDialog}>
			<DialogContent>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Button
							fullWidth
							variant={"contained"}
							onClick={resetFilterAndClose}
						>
							{t("standalone.data-grid.header.reset-options.filter")}
						</Button>
					</Grid>
					<Grid item xs={12}>
						<Button fullWidth variant={"contained"} onClick={resetSortAndClose}>
							{t("standalone.data-grid.header.reset-options.sort")}
						</Button>
					</Grid>
					<Grid item xs={12}>
						<Button
							fullWidth
							variant={"contained"}
							onClick={resetColumnAndClose}
						>
							{t("standalone.data-grid.header.reset-options.column")}
						</Button>
					</Grid>
					<Grid item xs={12}>
						<Button
							fullWidth
							variant={"contained"}
							onClick={resetWidthAndClose}
						>
							{t("standalone.data-grid.header.reset-options.width")}
						</Button>
					</Grid>
					<Grid item xs={12}>
						<Button fullWidth variant={"contained"} onClick={resetAllAndClose}>
							{t("standalone.data-grid.header.reset-options.all")}
						</Button>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(ResetDialog);
