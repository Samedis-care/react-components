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
	const {
		toggleSettings,
		handleAddNew,
		handleImport,
		hasCustomFilterBar,
		exporters,
		hideReset,
		// reset callbacks
		refresh,
		resetFilter,
		resetSort,
		resetColumn,
		resetWidth,
		resetAll,
	} = props;
	const theme = useTheme();
	const bpMdUp = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
	const bpSmUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });

	const { t } = useCCTranslations();

	const handleToggleSettings = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			evt.preventDefault();
			if (toggleSettings) toggleSettings();
		},
		[toggleSettings],
	);

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

	const addButtons: IDataGridAddButton[] = Array.isArray(handleAddNew)
		? handleAddNew
		: handleAddNew == null
			? []
			: [
					{
						icon: undefined,
						label: t("standalone.data-grid.header.new") ?? "",
						onClick:
							typeof handleAddNew === "function" ? handleAddNew : undefined,
						disableHint:
							typeof handleAddNew === "string" ? handleAddNew : undefined,
					},
				];

	return (
		<Grid container alignItems={"stretch"} wrap={"nowrap"}>
			{hasCustomFilterBar &&
			!bpSmUp &&
			(toggleSettings || !hideReset || exporters || handleImport) ? (
				<>
					<Grid key={"divider-1"}>
						<VerticalDivider />
					</Grid>
					<IconButton color={"primary"} onClick={openSettingsMenu} size="large">
						<MenuIcon />
					</IconButton>
					<ActionBarMenu
						anchorEl={settingsAnchorEl}
						toggleSettings={toggleSettings}
						openResetDialog={hideReset ? undefined : openResetDialog}
						openExportMenu={exporters ? openExportMenu : undefined}
						handleImport={handleImport}
						onClose={closeSettingsMenu}
					/>
				</>
			) : (
				<>
					{toggleSettings && (
						<>
							{hasCustomFilterBar && (
								<Grid key={"divider-1"}>
									<VerticalDivider />
								</Grid>
							)}
							<Grid key={"settings"}>
								{bpMdUp ? (
									<ComponentWithLabel
										control={
											<SmallestIconButton color={"primary"}>
												<TuneIcon />
											</SmallestIconButton>
										}
										labelText={t("standalone.data-grid.header.settings")}
										onClick={handleToggleSettings}
										labelPlacement={"bottom"}
									/>
								) : (
									<Tooltip
										title={t("standalone.data-grid.header.settings") ?? ""}
									>
										<IconButton
											color={"primary"}
											onClick={handleToggleSettings}
											size="large"
										>
											<TuneIcon />
										</IconButton>
									</Tooltip>
								)}
							</Grid>
						</>
					)}
					{!hideReset && (
						<>
							<Grid key={"divider-4"}>
								<VerticalDivider />
							</Grid>
							<Grid key={"reset"}>
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
					{exporters && (
						<>
							<Grid key={"divider-3"}>
								<VerticalDivider />
							</Grid>
							<Grid key={"export"}>
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
									exporters={exporters}
									anchorEl={exportAnchorEl}
									onClose={closeExportMenu}
								/>
							</Grid>
						</>
					)}
					{handleImport && (
						<>
							<Grid>
								<VerticalDivider />
							</Grid>
							<Grid key={"import"}>
								{bpMdUp ? (
									<ComponentWithLabel
										control={
											<SmallestIconButton color={"primary"}>
												<ImportIcon />
											</SmallestIconButton>
										}
										labelText={t("standalone.data-grid.header.import")}
										onClick={handleImport}
										labelPlacement={"bottom"}
									/>
								) : (
									<Tooltip
										title={t("standalone.data-grid.header.import") ?? ""}
									>
										<IconButton
											color={"primary"}
											onClick={handleImport}
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
					<Grid key={"divider-2"} size="grow" />
					<Grid
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
								<Grid key={index.toString()}>
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
				refresh={refresh}
				resetFilter={resetFilter}
				resetSort={resetSort}
				resetColumn={resetColumn}
				resetWidth={resetWidth}
				resetAll={resetAll}
			/>
		</Grid>
	);
};

export default React.memo(ActionBarView);
