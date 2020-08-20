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
	Error as ErrorIcon,
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
	Error,
}

const ExportMenuEntry = React.forwardRef(
	(props: IDataGridExportMenuEntryProps, ref) => {
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
			try {
				const [sorts, fieldFilter] = dataGridPrepareFiltersAndSorts(
					columnsState
				);
				const data = await onRequest(
					search,
					getAdditionalFilters ? getAdditionalFilters(customData) : {},
					fieldFilter,
					sorts
				);
				setExportData(data);
				setStatus(DataGridExportStatus.Ready);
			} catch (e) {
				setExportData(e);
				setStatus(DataGridExportStatus.Error);
			}
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
						<ListItemText primary={props.exporter.label} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Working && (
					<MenuItem innerRef={ref}>
						<ListItemIcon>
							<CircularProgress size={24} />
						</ListItemIcon>
						<ListItemText primary={props.exporter.workingLabel} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Ready && (
					<MenuItem onClick={finishExport} innerRef={ref}>
						<ListItemIcon>
							<DoneIcon />
						</ListItemIcon>
						<ListItemText primary={props.exporter.readyLabel} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Error && (
					<MenuItem onClick={cancelExport} innerRef={ref}>
						<ListItemIcon>
							<ErrorIcon />
						</ListItemIcon>
						<ListItemText primary={props.exporter.errorLabel} />
					</MenuItem>
				)}
			</>
		);
	}
);

export default React.memo(ExportMenuEntry);
