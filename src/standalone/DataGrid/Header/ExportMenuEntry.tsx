import React, { useCallback, useContext, useState } from "react";
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
} from "@material-ui/icons";
import {
	DataGridColumnsStateContext,
	DataGridPropsContext,
	DataGridStateContext,
} from "../index";
import { dataGridPrepareFiltersAndSorts } from "../CallbackUtil";

export interface IDataGridExportMenuEntryProps {
	/**
	 * The exporter for this entry
	 */
	exporter: IDataGridExporter<any>;
}

export enum DataGridExportStatus {
	Idle,
	Working,
	Ready,
}

const ExportMenuEntry = (props: IDataGridExportMenuEntryProps) => {
	const [state] = useContext(DataGridStateContext)!;
	const [columnsState] = useContext(DataGridColumnsStateContext)!;
	const { getAdditionalFilters } = useContext(DataGridPropsContext)!;
	const [status, setStatus] = useState(DataGridExportStatus.Idle);
	const [exportData, setExportData] = useState<any>(undefined);
	const IdleIcon = props.exporter.icon || ExportIcon;
	const { onRequest, onDownload } = props.exporter;
	const { search, customData } = state;

	const startExport = useCallback(async () => {
		setStatus(DataGridExportStatus.Working);
		const [sorts, fieldFilter] = dataGridPrepareFiltersAndSorts(columnsState);
		const data = await onRequest(
			search,
			getAdditionalFilters ? getAdditionalFilters(customData) : {},
			fieldFilter,
			sorts
		);
		setExportData(data);
		setStatus(DataGridExportStatus.Ready);
	}, [
		setStatus,
		setExportData,
		onRequest,
		columnsState,
		getAdditionalFilters,
		search,
		customData,
	]);

	const finishExport = useCallback(() => {
		onDownload(exportData);
		setStatus(DataGridExportStatus.Idle);
	}, [onDownload, setStatus, exportData]);

	return (
		<>
			{status === DataGridExportStatus.Idle && (
				<MenuItem onClick={startExport}>
					<ListItemIcon>
						<IdleIcon />
					</ListItemIcon>
					<ListItemText primary={props.exporter.label} />
				</MenuItem>
			)}
			{status === DataGridExportStatus.Working && (
				<MenuItem>
					<ListItemIcon>
						<CircularProgress size={24} />
					</ListItemIcon>
					<ListItemText primary={props.exporter.workingLabel} />
				</MenuItem>
			)}
			{status === DataGridExportStatus.Ready && (
				<MenuItem onClick={finishExport}>
					<ListItemIcon>
						<DoneIcon />
					</ListItemIcon>
					<ListItemText primary={props.exporter.readyLabel} />
				</MenuItem>
			)}
		</>
	);
};

export default React.memo(ExportMenuEntry);
