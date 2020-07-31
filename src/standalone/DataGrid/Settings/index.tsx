import React, { ChangeEvent, useCallback, useContext } from "react";
import {
	Box,
	Button,
	Checkbox,
	Collapse,
	Divider,
	FormControlLabel,
	Grid,
	Paper,
	Theme,
	Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DataGridStateContext, IDataGridColumnProps } from "../index";

const useStyles = makeStyles((theme: Theme) => ({
	wrapper: {
		padding: 16,
		borderBottom: `1px solid ${theme.palette.divider}`,
		borderRadius: 8,
	},
	collapse: {
		position: "absolute",
		zIndex: 1000,
		width: "100%",
		maxHeight: "100%",
		overflow: "auto",
	},
}));

export default React.memo((props: IDataGridColumnProps) => {
	const classes = useStyles();

	const [state, setState] = useContext(DataGridStateContext)!;
	const { columns } = props;

	const closeGridSettings = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			showSettings: false,
		}));
	}, [setState]);
	const toggleColumnLock = useCallback(
		(evt: ChangeEvent<HTMLInputElement>) => {
			const value = evt.target.value;
			setState((prevState) => ({
				...prevState,
				lockedColumns: prevState.lockedColumns.includes(value)
					? prevState.lockedColumns.filter((s) => s !== value)
					: [...prevState.lockedColumns, value],
			}));
		},
		[setState]
	);
	const toggleColumnVisibility = useCallback(
		(evt: ChangeEvent<HTMLInputElement>) => {
			const value = evt.target.value;
			setState((prevState) => ({
				...prevState,
				hiddenColumns: prevState.hiddenColumns.includes(value)
					? prevState.hiddenColumns.filter((s) => s !== value)
					: [...prevState.hiddenColumns, value],
			}));
		},
		[setState]
	);

	return (
		<Collapse className={classes.collapse} in={state.showSettings}>
			<Paper elevation={0} className={classes.wrapper}>
				<Typography variant={"h6"}>Lock/Unlock Columns</Typography>
				<Divider />
				<Grid justify={"space-between"} container>
					{columns.slice(1).map((column) => (
						<Grid item xs={4} key={column.field}>
							<FormControlLabel
								control={
									<Checkbox
										checked={state.lockedColumns.includes(column.field)}
										onChange={toggleColumnLock}
										value={column.field}
									/>
								}
								label={column.headerName}
							/>
						</Grid>
					))}
				</Grid>
				<Typography variant={"h6"}>Show/Hide Columns</Typography>
				<Divider />
				<Grid justify={"space-between"} container>
					{columns.slice(1).map((column) => (
						<Grid item xs={4} key={column.field}>
							<FormControlLabel
								control={
									<Checkbox
										checked={!state.hiddenColumns.includes(column.field)}
										onChange={toggleColumnVisibility}
										value={column.field}
									/>
								}
								label={column.headerName}
							/>
						</Grid>
					))}
				</Grid>
				<Divider />
				<Grid container justify={"flex-end"}>
					<Grid item>
						<Box m={2}>
							<Button onClick={closeGridSettings} variant={"contained"}>
								Close
							</Button>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Collapse>
	);
});
