import React, { ChangeEvent, useCallback } from "react";
import {
	DataGridContentOverlayCollapse,
	IDataGridColumnProps,
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import Dialog from "./SettingsDialog";

const DataGridSettings = (props: IDataGridColumnProps) => {
	const { classes } = useDataGridProps();

	const [state, setState] = useDataGridState();
	const [, setColumnState] = useDataGridColumnState();

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
				columnPinned: {
					...prevState.columnPinned,
					[value]: !prevState.columnPinned[value],
				},
			}));
		},
		[setState],
	);
	const toggleColumnVisibility = useCallback(
		(evt: ChangeEvent<HTMLInputElement>) => {
			const value = evt.target.value;
			setState((prevState) => ({
				...prevState,
				columnHidden: {
					...prevState.columnHidden,
					[value]: !prevState.columnHidden[value],
				},
			}));
			// clear column filter on column visibility toggle
			setColumnState((prevState) => ({
				...prevState,
				[value]: {
					...prevState[value],
					filter: undefined,
				},
			}));
		},
		[setColumnState, setState],
	);

	return (
		<DataGridContentOverlayCollapse
			className={classes?.contentOverlayCollapse}
			in={state.showSettings}
		>
			<Dialog
				columns={props.columns.filter(
					(col) =>
						!state.settingsSearch ||
						col.headerName.toLowerCase().includes(state.settingsSearch),
				)}
				closeGridSettings={closeGridSettings}
				toggleColumnLock={toggleColumnLock}
				toggleColumnVisibility={toggleColumnVisibility}
				columnPinned={state.columnPinned}
				columnHidden={state.columnHidden}
			/>
		</DataGridContentOverlayCollapse>
	);
};

export default React.memo(DataGridSettings);
