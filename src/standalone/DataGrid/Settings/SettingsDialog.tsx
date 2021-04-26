import React, { ChangeEvent } from "react";
import {
	Box,
	Button,
	Checkbox,
	Divider,
	FormControlLabel,
	Grid,
	Paper,
	Typography,
	withStyles,
} from "@material-ui/core";
import {
	IDataGridColumnDef,
	IDataGridColumnProps,
	useDataGridStyles,
} from "../DataGrid";
import i18n from "../../../i18n";
import { useTranslation } from "react-i18next";

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

const EllipsisFormControlLabel = withStyles({
	root: {
		maxWidth: "100%",
	},
	label: {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
})(FormControlLabel);

const SettingsDialog = (props: IDataGridSettingsDialogProps) => {
	const classes = useDataGridStyles();
	const { t } = useTranslation(undefined, { i18n });

	return (
		<Paper elevation={0} className={classes.contentOverlayPaper}>
			<Typography variant={"h6"}>
				{t("standalone.data-grid.settings.lock") || ""}
			</Typography>
			<Divider />
			<Grid justify={"space-between"} container>
				{props.columns.map((column: IDataGridColumnDef) => (
					<Grid item xs={4} key={column.field} zeroMinWidth>
						<EllipsisFormControlLabel
							control={
								<Checkbox
									checked={props.lockedColumns.includes(column.field)}
									onChange={props.toggleColumnLock}
									value={column.field}
								/>
							}
							label={column.headerName}
						/>
					</Grid>
				))}
			</Grid>
			<Typography variant={"h6"}>
				{t("standalone.data-grid.settings.hide") || ""}
			</Typography>
			<Divider />
			<Grid justify={"space-between"} container>
				{props.columns.map((column: IDataGridColumnDef) => (
					<Grid item xs={4} key={column.field} zeroMinWidth>
						<EllipsisFormControlLabel
							control={
								<Checkbox
									checked={!props.hiddenColumns.includes(column.field)}
									onChange={props.toggleColumnVisibility}
									value={column.field}
								/>
							}
							label={column.headerName}
						/>
					</Grid>
				))}
			</Grid>
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
		</Paper>
	);
};

export default React.memo(SettingsDialog);
