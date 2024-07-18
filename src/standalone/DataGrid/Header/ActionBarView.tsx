import React, { useCallback, useState } from "react";
import {
	Grid,
	IconButton,
	MenuProps,
	Tooltip,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import {
	Add as AddIcon,
	Menu as MenuIcon,
	Publish as ImportIcon,
} from "@mui/icons-material";
import { ExportIcon, ResetIcon, TuneIcon } from "../../Icons";
import ActionButton from "../../UIKit/ActionButton";
import { SmallestIconButton } from "../../Small";
import VerticalDivider from "../../VerticalDivider";
import type { IDataGridExporter } from "./index";
import ExportMenu from "./ExportMenu";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import { IDataGridAddButton } from "../DataGrid";
import ResetMenu, { ResetCallbacks } from "./ResetMenu";
import useCCTranslations from "../../../utils/useCCTranslations";
import ActionBarMenu from "./ActionBarMenu";

export interface IDataGridActionBarViewProps extends ResetCallbacks {
	/**
	 * Callback to toggle the settings popover
	 */
	toggleSettings?: () => void;
	/**
	 * Callback for add new button.
	 * If set to string: disabled add new button reason
	 * If not defined: Disables add new button
	 */
	handleAddNew?: (() => void) | string | IDataGridAddButton[];
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
	/**
	 * Hide reset menu
	 */
	hideReset: boolean;
}

const ActionBarView = (props: IDataGridActionBarViewProps) => {
	const theme = useTheme();
	const bpMdUp = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
	const bpSmUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });

	const { t } = useCCTranslations();
	const [exportAnchorEl, setExportAnchorEl] =
		useState<MenuProps["anchorEl"]>(undefined);
	const openExportMenu = useCallback(
		(evt: React.MouseEvent) => {
			setExportAnchorEl(evt.currentTarget);
		},
		[setExportAnchorEl],
	);

	const closeExportMenu = useCallback(() => {
		setExportAnchorEl(null);
	}, [setExportAnchorEl]);

	const [resetAnchorEl, setResetAnchorEl] =
		useState<MenuProps["anchorEl"]>(undefined);
	const openResetDialog = useCallback((evt: React.MouseEvent) => {
		setResetAnchorEl(evt.currentTarget);
	}, []);
	const closeResetMenu = useCallback(() => {
		setResetAnchorEl(null);
	}, []);

	const [settingsAnchorEl, setSettingsAnchorEl] =
		useState<MenuProps["anchorEl"]>(undefined);
	const openSettingsMenu = useCallback((evt: React.MouseEvent) => {
		setSettingsAnchorEl(evt.currentTarget);
	}, []);
	const closeSettingsMenu = useCallback(() => {
		setSettingsAnchorEl(undefined);
	}, []);

	const addButtons: IDataGridAddButton[] = Array.isArray(props.handleAddNew)
		? props.handleAddNew
		: props.handleAddNew == null
			? []
			: [
					{
						icon: undefined,
						label: t("standalone.data-grid.header.new") ?? "",
						onClick:
							typeof props.handleAddNew === "function"
								? props.handleAddNew
								: undefined,
						disableHint:
							typeof props.handleAddNew === "string"
								? props.handleAddNew
								: undefined,
					},
				];

	return (
		<Grid container alignItems={"stretch"} wrap={"nowrap"}>
			{props.hasCustomFilterBar &&
			!bpSmUp &&
			(props.toggleSettings ||
				!props.hideReset ||
				props.exporters ||
				props.handleImport) ? (
				<>
					<Grid item key={"divider-1"}>
						<VerticalDivider />
					</Grid>
					<IconButton color={"primary"} onClick={openSettingsMenu} size="large">
						<MenuIcon />
					</IconButton>
					<ActionBarMenu
						anchorEl={settingsAnchorEl}
						toggleSettings={props.toggleSettings}
						openResetDialog={props.hideReset ? undefined : openResetDialog}
						openExportMenu={props.exporters ? openExportMenu : undefined}
						handleImport={props.handleImport}
						onClose={closeSettingsMenu}
					/>
				</>
			) : (
				<>
					{props.toggleSettings && (
						<>
							{props.hasCustomFilterBar && (
								<Grid item key={"divider-1"}>
									<VerticalDivider />
								</Grid>
							)}
							<Grid item key={"settings"}>
								{bpMdUp ? (
									<ComponentWithLabel
										control={
											<SmallestIconButton color={"primary"}>
												<TuneIcon />
											</SmallestIconButton>
										}
										labelText={t("standalone.data-grid.header.settings")}
										onClick={props.toggleSettings}
										labelPlacement={"bottom"}
									/>
								) : (
									<Tooltip
										title={t("standalone.data-grid.header.settings") ?? ""}
									>
										<IconButton
											color={"primary"}
											onClick={props.toggleSettings}
											size="large"
										>
											<TuneIcon />
										</IconButton>
									</Tooltip>
								)}
							</Grid>
						</>
					)}
					{!props.hideReset && (
						<>
							<Grid item key={"divider-4"}>
								<VerticalDivider />
							</Grid>
							<Grid item key={"reset"}>
								{bpMdUp ? (
									<ComponentWithLabel
										control={
											<SmallestIconButton color={"primary"}>
												<ResetIcon />
											</SmallestIconButton>
										}
										labelText={t("standalone.data-grid.header.reset")}
										onClick={openResetDialog}
										labelPlacement={"bottom"}
									/>
								) : (
									<Tooltip title={t("standalone.data-grid.header.reset") ?? ""}>
										<IconButton
											color={"primary"}
											onClick={openResetDialog}
											size="large"
										>
											<ResetIcon />
										</IconButton>
									</Tooltip>
								)}
							</Grid>
						</>
					)}
					{props.exporters && (
						<>
							<Grid item key={"divider-3"}>
								<VerticalDivider />
							</Grid>
							<Grid item key={"export"}>
								{bpMdUp ? (
									<ComponentWithLabel
										control={
											<SmallestIconButton color={"primary"}>
												<ExportIcon />
											</SmallestIconButton>
										}
										labelText={t("standalone.data-grid.header.export")}
										onClick={openExportMenu}
										labelPlacement={"bottom"}
									/>
								) : (
									<Tooltip
										title={t("standalone.data-grid.header.export") ?? ""}
									>
										<IconButton
											color={"primary"}
											onClick={openExportMenu}
											size="large"
										>
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
											<SmallestIconButton color={"primary"}>
												<ImportIcon />
											</SmallestIconButton>
										}
										labelText={t("standalone.data-grid.header.import")}
										onClick={props.handleImport}
										labelPlacement={"bottom"}
									/>
								) : (
									<Tooltip
										title={t("standalone.data-grid.header.import") ?? ""}
									>
										<IconButton
											color={"primary"}
											onClick={props.handleImport}
											size="large"
										>
											<ImportIcon />
										</IconButton>
									</Tooltip>
								)}
							</Grid>
						</>
					)}
				</>
			)}
			{addButtons.length > 0 && (
				<>
					<Grid item xs key={"divider-2"} />
					<Grid
						item
						container
						key={"new"}
						justifyContent={"flex-end"}
						alignItems={"center"}
						spacing={2}
						wrap={"nowrap"}
					>
						{addButtons.map((entry, index) => {
							const btn = (
								<ActionButton
									small={!bpSmUp}
									icon={entry.icon ?? <AddIcon />}
									onClick={entry.onClick}
									disabled={!entry.onClick}
								>
									{entry.label}
								</ActionButton>
							);
							return (
								<Grid item key={index.toString()}>
									{!entry.onClick && entry.disableHint ? (
										<Tooltip title={entry.disableHint}>
											<span>{btn}</span>
										</Tooltip>
									) : (
										btn
									)}
								</Grid>
							);
						})}
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
