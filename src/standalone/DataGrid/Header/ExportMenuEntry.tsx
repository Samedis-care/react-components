import React, {
	useCallback,
	useContext,
	useId,
	useMemo,
	useState,
} from "react";
import { createPortal } from "react-dom";
import type { IDataGridExporter } from "./index";
import {
	CircularProgress,
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuProps,
	styled,
} from "@mui/material";
import {
	Description as ExportIcon,
	Done as DoneIcon,
	Error as ErrorIcon,
} from "@mui/icons-material";
import {
	dataGridGetFilterParameters,
	dataGridPrepareFiltersAndSorts,
} from "../CallbackUtil";
import {
	getActiveDataGridColumns,
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import { DialogContext } from "../../../framework";
import visuallyHidden from "../../../utils/internal/visuallyHidden";

export interface IDataGridExportMenuEntryProps {
	/**
	 * The exporter for this entry
	 */
	exporter: IDataGridExporter<unknown>;
	/**
	 * Close export menu
	 */
	closeMenu: NonNullable<MenuProps["onClose"]>;
	/**
	 * The element outside the menu that holds the entry's second status region
	 * (see ExportMenuEntry). While it is null (before it mounted) the entry
	 * renders only the region inside the menu.
	 */
	statusContainer: HTMLElement | null;
}

export enum DataGridExportStatus {
	Idle,
	Working,
	Ready,
	Error,
}

// the entry's status region inside the menu (a live region must exist before
// its text changes, so it is always rendered)
const EntryStatus = styled("span")(visuallyHidden);

/**
 * An entry of the export menu: requests the export, shows that it runs (then
 * it is unavailable, aria-disabled, and keeps focus), that it is ready (a
 * click downloads it) or that it failed (a click returns to the start).
 *
 * Ready and failed are announced by a polite status region that holds the
 * ready or error label while the entry shows it. The entry has two of them:
 * while the menu is open, MUI hides the rest of the page from assistive
 * technology, and while it is closed, the menu. One is in the entry, the other
 * one outside the menu, in statusContainer, so one of them is always exposed.
 */
// eslint-disable-next-line react/display-name
const ExportMenuEntry = React.forwardRef(
	(
		props: IDataGridExportMenuEntryProps,
		ref: React.ForwardedRef<HTMLLIElement>,
	) => {
		const { exporter, closeMenu, statusContainer } = props;
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
		const { search, customData, columnPinned, columnHidden } = state;

		// gets the data passed: right after the request, the state still holds
		// the previous export's data
		const download = useCallback(
			(data: unknown) => {
				onDownload(data, pushDialog);
				setStatus(DataGridExportStatus.Idle);
				if (!keepExportMenuOpenAfterDownload) closeMenu({}, "backdropClick");
			},
			[onDownload, pushDialog, closeMenu, keepExportMenuOpenAfterDownload],
		);
		const finishExport = useCallback(
			() => download(exportData),
			[download, exportData],
		);

		const startExport = useCallback(async () => {
			setStatus(DataGridExportStatus.Working);
			try {
				const [sorts] = dataGridPrepareFiltersAndSorts(columnsState);
				const { quickFilter, additionalFilters, fieldFilter } =
					dataGridGetFilterParameters(
						{ search, customData },
						columnsState,
						getAdditionalFilters,
					);
				const data = await onRequest(
					quickFilter,
					additionalFilters,
					fieldFilter,
					sorts,
					getActiveDataGridColumns(columns, columnHidden, columnPinned),
				);
				setExportData(data);
				setStatus(DataGridExportStatus.Ready);
				if (autoDownload) download(data);
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
			columnHidden,
			columnPinned,
			onError,
			autoDownload,
			download,
		]);

		const cancelExport = useCallback(() => {
			setStatus(DataGridExportStatus.Idle);
		}, [setStatus]);

		// the label alone names the entry, without the status in it
		const labelId = useId();
		const labelSlotProps = useMemo(
			() => ({ primary: { id: labelId } }),
			[labelId],
		);

		// one item for every status, so the item keeps keyboard focus while its
		// icon, label and click handler change
		let icon: React.ReactNode;
		let label: string;
		// startExport returns a promise; it catches a failed request itself
		let onClick: (() => Promise<void> | void) | undefined;
		// what the status regions say: the outcome of the export
		let statusText = "";
		switch (status) {
			case DataGridExportStatus.Idle:
				icon = <IdleIcon />;
				label = exporter.getLabel();
				onClick = startExport;
				break;
			case DataGridExportStatus.Working:
				// hidden from assistive technology: the label says that it runs
				icon = <CircularProgress size={24} aria-hidden />;
				label = exporter.getWorkingLabel();
				onClick = undefined;
				break;
			case DataGridExportStatus.Ready:
				icon = <DoneIcon />;
				label = exporter.getReadyLabel();
				onClick = finishExport;
				statusText = label;
				break;
			case DataGridExportStatus.Error:
				icon = <ErrorIcon />;
				label = exporter.getErrorLabel();
				onClick = cancelExport;
				statusText = label;
				break;
		}

		return (
			<>
				<MenuItem
					onClick={onClick}
					ref={ref}
					aria-disabled={status === DataGridExportStatus.Working || undefined}
					aria-labelledby={labelId}
				>
					<ListItemIcon>{icon}</ListItemIcon>
					<ListItemText primary={label} slotProps={labelSlotProps} />
					<EntryStatus role={"status"}>{statusText}</EntryStatus>
				</MenuItem>
				{statusContainer &&
					createPortal(
						<span role={"status"}>{statusText}</span>,
						statusContainer,
					)}
			</>
		);
	},
);

export default React.memo(ExportMenuEntry);
