import React, { useCallback, useContext, useState } from "react";
import type { IDataGridExporter } from "./index";
import {
	CircularProgress,
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuProps,
} from "@mui/material";
import {
	Description as ExportIcon,
	Done as DoneIcon,
	Error as ErrorIcon,
} from "@mui/icons-material";
import { dataGridPrepareFiltersAndSorts } from "../CallbackUtil";
import {
	getActiveDataGridColumns,
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import { DialogContext } from "../../../framework";

export interface IDataGridExportMenuEntryProps {
	/**
	 * The exporter for this entry
	 */
	exporter: IDataGridExporter<unknown>;
	/**
	 * Close export menu
	 */
	closeMenu: NonNullable<MenuProps["onClose"]>;
}

export enum DataGridExportStatus {
	Idle,
	Working,
	Ready,
	Error,
}

// eslint-disable-next-line react/display-name
const ExportMenuEntry = React.forwardRef(
	(
		props: IDataGridExportMenuEntryProps,
		ref: React.ForwardedRef<HTMLLIElement>,
	) => {
		const { exporter, closeMenu } = props;
		const {
			getAdditionalFilters,
			columns,
			onError,
			keepExportMenuOpenAfterDownload,
		} = useDataGridProps();
		const [columnsState] = useDataGridColumnState();
		const [state] = useDataGridState();
		const [pushDialog] = useContext(DialogContext) ?? [];

		const [status, setStatus] = useState(DataGridExportStatus.Idle);
		const [exportData, setExportData] = useState<unknown>(undefined);
		const IdleIcon = props.exporter.icon || ExportIcon;
		const { onRequest, onDownload, autoDownload } = props.exporter;
		const { search, customData, lockedColumns, hiddenColumns } = state;

		const finishExport = useCallback(() => {
			onDownload(exportData, pushDialog);
			setStatus(DataGridExportStatus.Idle);
			if (!keepExportMenuOpenAfterDownload) closeMenu({}, "backdropClick");
		}, [
			onDownload,
			exportData,
			pushDialog,
			closeMenu,
			keepExportMenuOpenAfterDownload,
		]);

		const startExport = useCallback(async () => {
			setStatus(DataGridExportStatus.Working);
			try {
				const [sorts, fieldFilter] =
					dataGridPrepareFiltersAndSorts(columnsState);
				const data = await onRequest(
					search,
					getAdditionalFilters ? getAdditionalFilters(customData) : {},
					fieldFilter,
					sorts,
					getActiveDataGridColumns(columns, hiddenColumns, lockedColumns),
				);
				setExportData(data);
				setStatus(DataGridExportStatus.Ready);
				if (autoDownload) finishExport();
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error("[Components-Care] DataGrid Export failed", e);
				if (onError) onError(e as Error);
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
			onError,
			autoDownload,
			finishExport,
		]);

		const cancelExport = useCallback(() => {
			setStatus(DataGridExportStatus.Idle);
		}, [setStatus]);

		return (
			<>
				{status === DataGridExportStatus.Idle && (
					<MenuItem onClick={startExport} ref={ref}>
						<ListItemIcon>
							<IdleIcon />
						</ListItemIcon>
						<ListItemText primary={exporter.getLabel()} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Working && (
					<MenuItem ref={ref}>
						<ListItemIcon>
							<CircularProgress size={24} />
						</ListItemIcon>
						<ListItemText primary={exporter.getWorkingLabel()} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Ready && (
					<MenuItem onClick={finishExport} ref={ref}>
						<ListItemIcon>
							<DoneIcon />
						</ListItemIcon>
						<ListItemText primary={exporter.getReadyLabel()} />
					</MenuItem>
				)}
				{status === DataGridExportStatus.Error && (
					<MenuItem onClick={cancelExport} ref={ref}>
						<ListItemIcon>
							<ErrorIcon />
						</ListItemIcon>
						<ListItemText primary={exporter.getErrorLabel()} />
					</MenuItem>
				)}
			</>
		);
	},
);

export default React.memo(ExportMenuEntry);
