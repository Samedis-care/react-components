import { createStyles, TableCell, Theme, withStyles } from "@material-ui/core";
import { combineColors } from "../../../utils";

const selectRowCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		left: 0,
		backgroundColor: "inherit",
		borderRight: `1px solid ${theme.palette.divider}`,
		zIndex: 1000,
		width: 48,
	},
}));
export const SelectRowCell = withStyles(selectRowCellStyles)(TableCell);

const dataGridCellStyles = createStyles((theme: Theme) => ({
	root: {
		borderRight: `1px solid ${theme.palette.divider}`,
	},
}));
export const DataGridCell = withStyles(dataGridCellStyles)(TableCell);

const fixedDataGridCellStyles = createStyles((theme: Theme) => ({
	root: {
		borderRight: `1px solid ${theme.palette.divider}`,
		position: "sticky",
		zIndex: 1001,
		backgroundColor: "inherit",
	},
}));
export const FixedDataGridCell = withStyles(fixedDataGridCellStyles)(TableCell);

const stickyHeaderCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		top: 0,
		backgroundColor: theme.palette.background.paper,
		borderBottom: `1px solid ${theme.palette.divider}`,
		borderRight: `1px solid ${theme.palette.divider}`,
		zIndex: 1000,
		"&:hover": {
			backgroundColor: `rgba(${combineColors(
				theme.palette.background.paper,
				theme.palette.action.hover
			).join()})`,
		},
	},
}));
export const StickyHeaderCell = withStyles(stickyHeaderCellStyles)(TableCell);

const selectAllCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		top: 0,
		left: 0,
		backgroundColor: theme.palette.background.paper,
		borderBottom: `1px solid ${theme.palette.divider}`,
		borderRight: `1px solid ${theme.palette.divider}`,
		zIndex: 1001,
		width: 48,
	},
}));
export const SelectAllCell = withStyles(selectAllCellStyles)(TableCell);

const spacingCellStyles = createStyles({
	root: {
		minWidth: 0,
		padding: 0,
	},
});
export const SpacingCell = withStyles(spacingCellStyles)(TableCell);
