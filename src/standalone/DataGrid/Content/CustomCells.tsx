import { createStyles, TableCell, Theme, withStyles } from "@material-ui/core";

const selectRowCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		left: 0,
		backgroundColor: theme.palette.background.paper,
		borderRight: `1px solid ${theme.palette.divider}`,
		zIndex: 1000,
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
		backgroundColor: theme.palette.background.paper,
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
	},
}));
export const SelectAllCell = withStyles(selectAllCellStyles)(TableCell);
