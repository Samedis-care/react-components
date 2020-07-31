import React, { useContext } from "react";
import {
	createStyles,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Theme,
	useTheme,
	withStyles,
	makeStyles,
	Grid,
	Checkbox,
} from "@material-ui/core";
import { FilterList as FilterIcon } from "@material-ui/icons";
import { DataGridStateContext, IDataGridColumnProps } from "../index";
import { measureText } from "../../../utils";

const useStyles = makeStyles({
	contentWrapper: {
		position: "absolute",
		maxHeight: "100%",
		width: "100%",
		overflow: "auto",
	},
	table: {
		borderCollapse: "separate",
	},
	filterButton: {
		padding: 0,
	},
	selectCheckbox: {
		padding: 0,
	},
});

const stickyHeaderCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		top: 0,
		backgroundColor: theme.palette.background.paper,
		borderBottom: `1px solid ${theme.palette.divider}`,
	},
}));
const StickyHeaderCell = withStyles(stickyHeaderCellStyles)(TableCell);
const selectAllCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "absolute",
		top: 0,
		left: 0,
		backgroundColor: theme.palette.background.paper,
		borderBottom: `1px solid ${theme.palette.divider}`,
		zIndex: 1001,
	},
}));
const SelectAllCell = withStyles(selectAllCellStyles)(TableCell);
const selectRowCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		left: 0,
		backgroundColor: theme.palette.background.paper,
		zIndex: 1000,
	},
}));
const SelectRowCell = withStyles(selectRowCellStyles)(TableCell);

export default React.memo((props: IDataGridColumnProps) => {
	const [state] = useContext(DataGridStateContext)!;

	const classes = useStyles();
	const theme = useTheme();

	return (
		<div className={classes.contentWrapper}>
			<Table className={classes.table}>
				<TableHead>
					<TableRow>
						<SelectAllCell>
							<Checkbox className={classes.selectCheckbox} />
						</SelectAllCell>
						{props.columns.map((column) => (
							<StickyHeaderCell
								key={column.field}
								style={{
									minWidth:
										measureText(theme.typography.body1.font!, column.headerName)
											.width + 100,
								}}
							>
								<Grid container justify={"space-between"}>
									<Grid item>{column.headerName}</Grid>
									<Grid item>
										<IconButton className={classes.filterButton}>
											<FilterIcon />
										</IconButton>
									</Grid>
								</Grid>
							</StickyHeaderCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{new Array(state.rowsPerPage).fill(undefined).map((_, index) => (
						<TableRow key={index}>
							<SelectRowCell>
								<Checkbox className={classes.selectCheckbox} />
							</SelectRowCell>
							{props.columns.map((column, colIndex) => (
								<TableCell key={column.field}>
									Field {colIndex * index}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
});
