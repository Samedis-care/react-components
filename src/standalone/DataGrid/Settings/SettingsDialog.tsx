import React, { ChangeEvent } from "react";
import {
	Box,
	Button,
	Checkbox,
	Divider,
	Grid,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "@material-ui/core";
import {
	IDataGridColumnDef,
	IDataGridColumnProps,
	useDataGridStyles,
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

const SettingsDialog = (props: IDataGridSettingsDialogProps) => {
	const classes = useDataGridStyles();
	const { t } = useCCTranslations();

	return (
		<Paper elevation={0} className={classes.contentOverlayPaper}>
			<Table stickyHeader>
				<TableHead>
					<TableRow>
						<TableCell>{t("standalone.data-grid.settings.column")}</TableCell>
						<TableCell>{t("standalone.data-grid.settings.show")}</TableCell>
						<TableCell>{t("standalone.data-grid.settings.pin")}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{props.columns.map((column: IDataGridColumnDef) => (
						<TableRow key={column.field}>
							<TableCell>{column.headerName}</TableCell>
							<TableCell>
								<Checkbox
									checked={!props.hiddenColumns.includes(column.field)}
									onChange={props.toggleColumnVisibility}
									value={column.field}
								/>
							</TableCell>
							<TableCell>
								<Checkbox
									checked={props.lockedColumns.includes(column.field)}
									disabled={props.hiddenColumns.includes(column.field)}
									onChange={props.toggleColumnLock}
									value={column.field}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className={classes.contentOverlayClosed}>
				<Divider />
				<Grid container justify={"flex-end"}>
					<Grid item>
						<Box m={2}>
							<Button onClick={props.closeGridSettings} variant={"contained"}>
								{t("standalone.data-grid.settings.close") || ""}
							</Button>
						</Box>
					</Grid>
				</Grid>
			</div>
		</Paper>
	);
};

export default React.memo(SettingsDialog);
