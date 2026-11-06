import React, { ChangeEvent, useId, useMemo } from "react";
import {
	Box,
	Button,
	Divider,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	styled,
} from "@mui/material";
import {
	DataGridContentOverlayClosed,
	DataGridContentOverlayPaper,
	IDataGridColumnDef,
	IDataGridColumnProps,
	isDataGridColumnPinned,
	useDataGridProps,
} from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import SettingsCheckbox from "./SettingsCheckbox";

export interface IDataGridSettingsDialogProps extends IDataGridColumnProps {
	/**
	 * Callback to close settings pop-over
	 */
	closeGridSettings: () => void;
	/**
	 * Event to toggle column locked state
	 * @param evt The change event
	 */
	toggleColumnLock: (evt: ChangeEvent<HTMLInputElement>) => void;
	/**
	 * Event to toggle column hidden state
	 * @param evt The change event
	 */
	toggleColumnVisibility: (evt: ChangeEvent<HTMLInputElement>) => void;
	/**
	 * Is the column pinned? (field -> pinned)
	 */
	columnPinned: Record<string, boolean>;
	/**
	 * Is the column hidden? (field -> hidden)
	 */
	columnHidden: Record<string, boolean>;
}

const StyledTable = styled(Table, {
	name: "CcDataGrid",
	slot: "settingsTable",
})({});

const StyledTableRow = styled(TableRow, {
	name: "CcDataGrid",
	slot: "settingsTableRow",
})({});

const StyledTableHead = styled(TableHead, {
	name: "CcDataGrid",
	slot: "settingsTableHead",
})({});

const StyledTableBody = styled(TableBody, {
	name: "CcDataGrid",
	slot: "settingsTableBody",
})({});

const StyledTableCell = styled(TableCell, {
	name: "CcDataGrid",
	slot: "settingsTableCell",
})({
	padding: 4,
});

const SettingsDialog = (props: IDataGridSettingsDialogProps) => {
	const { classes } = useDataGridProps();
	const { t } = useCCTranslations();
	const id = useId();
	const visibleHeaderId = `${id}-visible`;
	const pinHeaderId = `${id}-pin`;
	const pinHiddenReasonId = `${id}-pin-hidden`;
	const pinForcedReasonId = `${id}-pin-forced`;

	const columns = useMemo(
		() =>
			[...props.columns].sort((a, b) =>
				a.headerName.localeCompare(b.headerName),
			),
		[props.columns],
	);

	return (
		<DataGridContentOverlayPaper
			elevation={0}
			className={classes?.contentOverlayPaper}
		>
			<StyledTable
				stickyHeader
				aria-label={t("standalone.data-grid.header.settings")}
			>
				<StyledTableHead className={classes?.settingsTableHead}>
					<StyledTableRow className={classes?.settingsTableRow}>
						<StyledTableCell className={classes?.settingsTableCell}>
							{t("standalone.data-grid.settings.column")}
						</StyledTableCell>
						<StyledTableCell
							id={visibleHeaderId}
							className={classes?.settingsTableCell}
						>
							{t("standalone.data-grid.settings.show")}
						</StyledTableCell>
						<StyledTableCell
							id={pinHeaderId}
							className={classes?.settingsTableCell}
						>
							{t("standalone.data-grid.settings.pin")}
						</StyledTableCell>
					</StyledTableRow>
				</StyledTableHead>
				<StyledTableBody className={classes?.settingsTableBody}>
					{columns.map((column: IDataGridColumnDef, index) => {
						const rowHeaderId = `${id}-row-${index}`;
						const hidden = !!props.columnHidden[column.field];
						// why the column's pin cannot be changed
						const pinReasonId = column.forcePin
							? pinForcedReasonId
							: hidden
								? pinHiddenReasonId
								: undefined;
						return (
							<StyledTableRow
								key={column.field}
								className={classes?.settingsTableRow}
							>
								<StyledTableCell
									component={"th"}
									scope={"row"}
									id={rowHeaderId}
									className={classes?.settingsTableCell}
								>
									{column.headerName}
								</StyledTableCell>
								<StyledTableCell className={classes?.settingsTableCell}>
									<SettingsCheckbox
										field={column.field}
										checked={!hidden}
										onChange={props.toggleColumnVisibility}
										labelledBy={`${visibleHeaderId} ${rowHeaderId}`}
									/>
								</StyledTableCell>
								<StyledTableCell className={classes?.settingsTableCell}>
									<SettingsCheckbox
										field={column.field}
										checked={isDataGridColumnPinned(column, props.columnPinned)}
										disabled={!!pinReasonId}
										onChange={props.toggleColumnLock}
										labelledBy={`${pinHeaderId} ${rowHeaderId}`}
										describedBy={pinReasonId}
									/>
								</StyledTableCell>
							</StyledTableRow>
						);
					})}
				</StyledTableBody>
			</StyledTable>
			<span hidden id={pinHiddenReasonId}>
				{t("standalone.data-grid.settings.pin-hidden")}
			</span>
			<span hidden id={pinForcedReasonId}>
				{t("standalone.data-grid.settings.pin-forced")}
			</span>
			<DataGridContentOverlayClosed className={classes?.contentOverlayClosed}>
				<Divider />
				<Grid container sx={{ justifyContent: "flex-end" }}>
					<Grid>
						<Box sx={{ m: 2 }}>
							<Button onClick={props.closeGridSettings} variant={"contained"}>
								{t("standalone.data-grid.settings.close") || ""}
							</Button>
						</Box>
					</Grid>
				</Grid>
			</DataGridContentOverlayClosed>
		</DataGridContentOverlayPaper>
	);
};

export default React.memo(SettingsDialog);
