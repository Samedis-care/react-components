import React, { ChangeEvent, useCallback, useContext } from "react";
import { Collapse } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DataGridStateContext, IDataGridColumnProps } from "../index";
import Dialog from "./Dialog";

const useStyles = makeStyles({
	collapse: {
		position: "absolute",
		zIndex: 2000,
		width: "100%",
		maxHeight: "100%",
		overflow: "auto",
	},
});

export default React.memo((props: IDataGridColumnProps) => {
	const classes = useStyles();

	const [state, setState] = useContext(DataGridStateContext)!;

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
			<Dialog
				columns={props.columns}
				closeGridSettings={closeGridSettings}
				toggleColumnLock={toggleColumnLock}
				toggleColumnVisibility={toggleColumnVisibility}
				lockedColumns={state.lockedColumns}
				hiddenColumns={state.hiddenColumns}
			/>
		</Collapse>
	);
});
