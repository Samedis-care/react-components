import React, { useCallback, useState } from "react";
import {
	Grid,
	IconButton,
	MenuProps,
	Tooltip,
	useMediaQuery,
	useTheme,
} from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";
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
import i18n from "../../../i18n";
import { useTranslation } from "react-i18next";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import { IDataGridAddButton } from "../DataGrid";

export interface IDataGridActionBarViewProps {
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
	 * Callback for reset button
	 */
	handleReset: () => void;
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

	const { t } = useTranslation(undefined, { i18n });
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
						onClick={props.handleReset}
						labelPlacement={"bottom"}
					/>
				) : (
					<Tooltip title={t("standalone.data-grid.header.reset") ?? ""}>
						<IconButton color={"primary"} onClick={props.handleReset}>
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
		</Grid>
	);
};

export default React.memo(ActionBarView);
