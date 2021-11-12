import React, { useCallback, useState } from "react";
import {
	Grid,
	IconButton,
	MenuProps,
	Tooltip,
	useMediaQuery,
	useTheme,
} from "@material-ui/core";
import { Add as AddIcon, Publish as ImportIcon } from "@material-ui/icons";
import {
	ActionButton,
	ExportIcon,
	ResetIcon,
	SmallIconButton,
	TuneIcon,
	VerticalDivider,
} from "../../index";
import { IDataGridExporter } from "./index";
import ExportMenu from "./ExportMenu";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import { IDataGridAddButton } from "../DataGrid";
import ResetMenu, { ResetCallbacks } from "./ResetMenu";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface IDataGridActionBarViewProps extends ResetCallbacks {
	/**
	 * Callback to toggle the settings popover
	 */
	toggleSettings: () => void;
	/**
	 * Callback for add new button.
	 * If not defined: Disables add new button
	 */
	handleAddNew?: (() => void) | IDataGridAddButton[];
	/**
	 * Callback for import button click
	 * If not defined: Disables import button
	 */
	handleImport?: () => void;
	/**
	 * Does this grid have an custom filter bar?
	 */
	hasCustomFilterBar: boolean;
	/**
	 * List of available export providers
	 */
	exporters?: IDataGridExporter<unknown>[];
}

const ActionBarView = (props: IDataGridActionBarViewProps) => {
	const theme = useTheme();
	const bpMdUp = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
	const bpSmUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });

	const { t } = useCCTranslations();
	const [exportAnchorEl, setExportAnchorEl] = useState<MenuProps["anchorEl"]>(
		undefined
	);
	const openExportMenu = useCallback(
		(evt: React.MouseEvent) => {
			setExportAnchorEl(evt.currentTarget);
		},
		[setExportAnchorEl]
	);

	const closeExportMenu = useCallback(() => {
		setExportAnchorEl(null);
	}, [setExportAnchorEl]);

	const [resetAnchorEl, setResetAnchorEl] = useState<MenuProps["anchorEl"]>(
		undefined
	);
	const openResetDialog = useCallback((evt: React.MouseEvent) => {
		setResetAnchorEl(evt.currentTarget);
	}, []);
	const closeResetMenu = useCallback(() => {
		setResetAnchorEl(null);
	}, []);

	return (
		<Grid container alignItems={"stretch"} wrap={"nowrap"}>
			{props.hasCustomFilterBar && (
				<Grid item key={"divider-1"}>
					<VerticalDivider />
				</Grid>
			)}
			<Grid item key={"settings"}>
				{bpMdUp ? (
					<ComponentWithLabel
						control={
							<SmallIconButton color={"primary"}>
								<TuneIcon />
							</SmallIconButton>
						}
						labelText={t("standalone.data-grid.header.settings")}
						onClick={props.toggleSettings}
						labelPlacement={"bottom"}
					/>
				) : (
					<Tooltip title={t("standalone.data-grid.header.settings") ?? ""}>
						<IconButton color={"primary"} onClick={props.toggleSettings}>
							<TuneIcon />
						</IconButton>
					</Tooltip>
				)}
			</Grid>
			<Grid item key={"divider-4"}>
				<VerticalDivider />
			</Grid>
			<Grid item key={"reset"}>
				{bpMdUp ? (
					<ComponentWithLabel
						control={
							<SmallIconButton color={"primary"}>
								<ResetIcon />
							</SmallIconButton>
						}
						labelText={t("standalone.data-grid.header.reset")}
						onClick={openResetDialog}
						labelPlacement={"bottom"}
					/>
				) : (
					<Tooltip title={t("standalone.data-grid.header.reset") ?? ""}>
						<IconButton color={"primary"} onClick={openResetDialog}>
							<ResetIcon />
						</IconButton>
					</Tooltip>
				)}
			</Grid>
			{props.exporters && (
				<>
					<Grid item key={"divider-3"}>
						<VerticalDivider />
					</Grid>
					<Grid item key={"export"}>
						{bpMdUp ? (
							<ComponentWithLabel
								control={
									<SmallIconButton color={"primary"}>
										<ExportIcon />
									</SmallIconButton>
								}
								labelText={t("standalone.data-grid.header.export")}
								onClick={openExportMenu}
								labelPlacement={"bottom"}
							/>
						) : (
							<Tooltip title={t("standalone.data-grid.header.export") ?? ""}>
								<IconButton color={"primary"} onClick={openExportMenu}>
									<ExportIcon />
								</IconButton>
							</Tooltip>
						)}
						<ExportMenu
							exporters={props.exporters}
							anchorEl={exportAnchorEl}
							onClose={closeExportMenu}
						/>
					</Grid>
				</>
			)}
			{props.handleImport && (
				<>
					<Grid item>
						<VerticalDivider />
					</Grid>
					<Grid item key={"import"}>
						{bpMdUp ? (
							<ComponentWithLabel
								control={
									<SmallIconButton color={"primary"}>
										<ImportIcon />
									</SmallIconButton>
								}
								labelText={t("standalone.data-grid.header.import")}
								onClick={props.handleImport}
								labelPlacement={"bottom"}
							/>
						) : (
							<Tooltip title={t("standalone.data-grid.header.import") ?? ""}>
								<IconButton color={"primary"} onClick={props.handleImport}>
									<ImportIcon />
								</IconButton>
							</Tooltip>
						)}
					</Grid>
				</>
			)}
			{props.handleAddNew && (
				<>
					<Grid item xs key={"divider-2"} />
					<Grid
						item
						container
						key={"new"}
						justify={"flex-end"}
						alignItems={"center"}
						spacing={2}
						wrap={"nowrap"}
					>
						{typeof props.handleAddNew === "function" ? (
							<Grid item>
								<ActionButton
									small={!bpSmUp}
									icon={<AddIcon />}
									onClick={props.handleAddNew}
								>
									{t("standalone.data-grid.header.new") ?? ""}
								</ActionButton>
							</Grid>
						) : (
							props.handleAddNew.map((entry, index) => (
								<Grid item key={index.toString()}>
									<ActionButton
										small={!bpSmUp}
										icon={entry.icon ?? <AddIcon />}
										onClick={entry.onClick}
										disabled={!entry.onClick}
									>
										{entry.label}
									</ActionButton>
								</Grid>
							))
						)}
					</Grid>
				</>
			)}
			<ResetMenu
				anchorEl={resetAnchorEl}
				onClose={closeResetMenu}
				refresh={props.refresh}
				resetFilter={props.resetFilter}
				resetSort={props.resetSort}
				resetColumn={props.resetColumn}
				resetWidth={props.resetWidth}
				resetAll={props.resetAll}
			/>
		</Grid>
	);
};

export default React.memo(ActionBarView);
