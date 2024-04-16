import React, { ChangeEvent, useMemo } from "react";
import {
	Box,
	Button,
	Checkbox,
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
	useDataGridProps,
} from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	 * The currently locked columns
	 */
	lockedColumns: string[];
	/**
	 * The currently hidden columns
	 */
	hiddenColumns: string[];
}

const StyledTableCell = styled(TableCell, {
	name: "CcDataGrid",
	slot: "settingsTableCell",
})({
	padding: 4,
});

const SettingsDialog = (props: IDataGridSettingsDialogProps) => {
	const { classes } = useDataGridProps();
	const { t } = useCCTranslations();

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
			<Table stickyHeader>
				<TableHead>
					<TableRow>
						<StyledTableCell>
							{t("standalone.data-grid.settings.column")}
						</StyledTableCell>
						<StyledTableCell>
							{t("standalone.data-grid.settings.show")}
						</StyledTableCell>
						<StyledTableCell>
							{t("standalone.data-grid.settings.pin")}
						</StyledTableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{columns.map((column: IDataGridColumnDef) => (
						<TableRow key={column.field}>
							<StyledTableCell>{column.headerName}</StyledTableCell>
							<StyledTableCell>
								<Checkbox
									checked={!props.hiddenColumns.includes(column.field)}
									onChange={props.toggleColumnVisibility}
									value={column.field}
								/>
							</StyledTableCell>
							<StyledTableCell>
								<Checkbox
									checked={props.lockedColumns.includes(column.field)}
									disabled={
										props.hiddenColumns.includes(column.field) ||
										column.forcePin
									}
									onChange={props.toggleColumnLock}
									value={column.field}
								/>
							</StyledTableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<DataGridContentOverlayClosed className={classes?.contentOverlayClosed}>
				<Divider />
				<Grid container justifyContent={"flex-end"}>
					<Grid item>
						<Box m={2}>
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
