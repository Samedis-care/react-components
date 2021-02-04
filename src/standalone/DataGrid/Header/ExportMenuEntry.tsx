import React, { useCallback, useState } from "react";
import { IDataGridExporter } from "./index";
import {
	CircularProgress,
	ListItemIcon,
	ListItemText,
	MenuItem,
} from "@material-ui/core";
import {
	Description as ExportIcon,
	Done as DoneIcon,
	Error as ErrorIcon,
} from "@material-ui/icons";
import { dataGridPrepareFiltersAndSorts } from "../CallbackUtil";
import {
	getActiveDataGridColumns,
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "../index";

export interface IDataGridExportMenuEntryProps {
	/**
	 * The exporter for this entry
	 */
	exporter: IDataGridExporter<unknown>;
}

export enum DataGridExportStatus {
	Idle,
	Working,
	Ready,
	Error,
}

// eslint-disable-next-line react/display-name
const ExportMenuEntry = React.forwardRef(
	(props: IDataGridExportMenuEntryProps, ref) => {
		const { getAdditionalFilters, columns } = useDataGridProps();
		const [columnsState] = useDataGridColumnState();
		const [state] = useDataGridState();

		const [status, setStatus] = useState(DataGridExportStatus.Idle);
		const [exportData, setExportData] = useState<unknown>(undefined);
		const IdleIcon = props.exporter.icon || ExportIcon;
		const { onRequest, onDownload } = props.exporter;
		const { search, customData, lockedColumns, hiddenColumns } = state;

		const startExport = useCallback(async () => {
			setStatus(DataGridExportStatus.Working);
			try {
				const [sorts, fieldFilter] = dataGridPrepareFiltersAndSorts(
					columnsState
				);
				const data = await onRequest(
					search,
					getAdditionalFilters ? getAdditionalFilters(customData) : {},
					fieldFilter,
					sorts,
					getActiveDataGridColumns(columns, hiddenColumns, lockedColumns)
				);
				setExportData(data);
				setStatus(DataGridExportStatus.Ready);
			} catch (e) {
				setExportData(e);
				setStatus(DataGridExportStatus.Error);
			}
		}, [
			columnsState,
			onRequest,
			search,
			getAdditionalFilters,
			customData,
			columns,
			hiddenColumns,
			lockedColumns,
		]);

		const finishExport = useCallback(() => {
			onDownload(exportData);
			setStatus(DataGridExportStatus.Idle);
		}, [onDownload, setStatus, exportData]);

		const cancelExport = useCallback(() => {
			setStatus(DataGridExportStatus.Idle);
		}, [setStatus]);

		return (
			<>
				{status === DataGridExportStatus.Idle && (
					<MenuItem onClick={startExport} innerRef={ref}>
						<ListItemIcon>
							<IdleIcon />
						</ListItemIcon>
						<ListItemText primary={props.exporter.getLabel()} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Working && (
					<MenuItem innerRef={ref}>
						<ListItemIcon>
							<CircularProgress size={24} />
						</ListItemIcon>
						<ListItemText primary={props.exporter.getWorkingLabel()} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Ready && (
					<MenuItem onClick={finishExport} innerRef={ref}>
						<ListItemIcon>
							<DoneIcon />
						</ListItemIcon>
						<ListItemText primary={props.exporter.getReadyLabel()} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Error && (
					<MenuItem onClick={cancelExport} innerRef={ref}>
						<ListItemIcon>
							<ErrorIcon />
						</ListItemIcon>
						<ListItemText primary={props.exporter.getErrorLabel()} />
					</MenuItem>
				)}
			</>
		);
	}
);

export default React.memo(ExportMenuEntry);
