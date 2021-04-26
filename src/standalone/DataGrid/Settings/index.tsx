import React, { ChangeEvent, useCallback } from "react";
import { Collapse } from "@material-ui/core";
import {
	IDataGridColumnProps,
	useDataGridState,
	useDataGridStyles,
} from "../DataGrid";
import Dialog from "./SettingsDialog";

const DataGridSettings = (props: IDataGridColumnProps) => {
	const classes = useDataGridStyles();

	const [state, setState] = useDataGridState();

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
		<Collapse
			className={classes.contentOverlayCollapse}
			in={state.showSettings}
		>
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
};

export default React.memo(DataGridSettings);
