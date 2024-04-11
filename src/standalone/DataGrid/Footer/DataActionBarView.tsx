import React, { useCallback, useState } from "react";
import {
	Grid,
	MenuProps,
	Tooltip,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { SmallIconButton } from "../../Small";
import VerticalDivider from "../../VerticalDivider";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import {
	Delete as DeleteIcon,
	Edit as EditIcon,
	Menu as MenuIcon,
} from "@mui/icons-material";
import SelectAll from "./SelectAll";
import {
	DataGridProps,
	DataGridSelectAllWrapper,
	useDataGridProps,
} from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import DataActionBarMenu from "./DataActionBarMenu";

export interface DataActionBarViewProps {
	/**
	 * The amount of selected items
	 * Values: 0 (none), 1 (one) or 2 (multiple)
	 */
	numSelected: 0 | 1 | 2;
	/**
	 * Callback for edit button.
	 * If not defined: Disables edit button
	 */
	handleEdit?: React.MouseEventHandler;
	/**
	 * Callback for delete button.
	 * If not defined: Disables delete button
	 */
	handleDelete?: React.MouseEventHandler;
	/**
	 * Disable delete button reason
	 */
	disableDeleteHint?: string;
	/**
	 * @see DataGridProps.customDataActionButtons
	 */
	customButtons: DataGridProps["customDataActionButtons"];
	/**
	 * Forward click to external handler
	 * @param label The label of the custom button
	 */
	handleCustomButtonClick: (label: string) => void;
	/**
	 * Disable select all button
	 */
	disableSelection: boolean;
}

const DataActionBarView = (props: DataActionBarViewProps) => {
	const { classes } = useDataGridProps();
	const { t } = useCCTranslations();
	const theme = useTheme();
	const isXs = useMediaQuery(theme.breakpoints.only("xs"));

	const [extendedMenuAnchor, setExtendedMenuAnchor] =
		useState<MenuProps["anchorEl"]>(undefined);
	const handleExtendedMenuOpen = useCallback((evt: React.MouseEvent) => {
		setExtendedMenuAnchor(evt.currentTarget);
	}, []);
	const handleExtendedMenuClose = useCallback(() => {
		setExtendedMenuAnchor(undefined);
	}, []);

	const deleteBtn = (
		<ComponentWithLabel
			control={
				<SmallIconButton
					color={"primary"}
					disabled={props.numSelected === 0 || !props.handleDelete}
					onClick={props.handleDelete}
				>
					<DeleteIcon />
				</SmallIconButton>
			}
			labelText={t("standalone.data-grid.footer.delete")}
			labelPlacement={"bottom"}
			disabled={props.numSelected === 0 || !props.handleDelete}
		/>
	);

	return (
		<Grid container wrap={"nowrap"}>
			<Grid item key={"select-all"}>
				<DataGridSelectAllWrapper
					control={<SelectAll />}
					labelText={t("standalone.data-grid.footer.select-all")}
					labelPlacement={"bottom"}
					className={classes?.selectAllWrapper}
					style={
						props.disableSelection
							? { opacity: 0, pointerEvents: "none" }
							: undefined
					}
				/>
			</Grid>
			{props.handleEdit && (
				<>
					<Grid item key={"divider-1"}>
						<VerticalDivider />
					</Grid>
					<Grid item key={"edit"}>
						<ComponentWithLabel
							control={
								<SmallIconButton
									color={"primary"}
									disabled={props.numSelected !== 1}
									onClick={props.handleEdit}
								>
									<EditIcon />
								</SmallIconButton>
							}
							labelText={t("standalone.data-grid.footer.edit")}
							labelPlacement={"bottom"}
							disabled={props.numSelected !== 1}
						/>
					</Grid>
				</>
			)}
			{(props.handleDelete || props.disableDeleteHint) && (
				<>
					<Grid item key={"divider-2"}>
						<VerticalDivider />
					</Grid>
					<Grid item key={"delete"}>
						{!props.handleDelete && props.disableDeleteHint ? (
							<Tooltip title={props.disableDeleteHint}>
								<span>{deleteBtn}</span>
							</Tooltip>
						) : (
							deleteBtn
						)}
					</Grid>
				</>
			)}
			{isXs && props.customButtons && props.customButtons.length > 1 ? (
				<React.Fragment key={"custom-buttons-menu"}>
					<Grid item>
						<VerticalDivider />
					</Grid>
					<Grid item>
						<ComponentWithLabel
							control={
								<SmallIconButton
									color={"primary"}
									disabled={
										!props.customButtons.find(
											(entry) => !entry.isDisabled(props.numSelected),
										)
									}
									onClick={handleExtendedMenuOpen}
								>
									<MenuIcon />
								</SmallIconButton>
							}
							labelText={t("standalone.data-grid.footer.more")}
							labelPlacement={"bottom"}
							disabled={
								!props.customButtons.find(
									(entry) => !entry.isDisabled(props.numSelected),
								)
							}
						/>
					</Grid>
					<DataActionBarMenu
						numSelected={props.numSelected}
						anchorEl={extendedMenuAnchor}
						onClose={handleExtendedMenuClose}
						customButtons={props.customButtons}
						handleCustomButtonClick={props.handleCustomButtonClick}
					/>
				</React.Fragment>
			) : (
				props.customButtons?.map((entry) => (
					<React.Fragment key={entry.label}>
						<Grid item>
							<VerticalDivider />
						</Grid>
						<Grid item>
							<ComponentWithLabel
								control={
									<SmallIconButton
										color={"primary"}
										disabled={entry.isDisabled(props.numSelected)}
										onClick={() => {
											props.handleCustomButtonClick(entry.label);
										}}
									>
										{entry.icon}
									</SmallIconButton>
								}
								labelText={entry.label}
								labelPlacement={"bottom"}
								disabled={entry.isDisabled(props.numSelected)}
							/>
						</Grid>
					</React.Fragment>
				))
			)}
		</Grid>
	);
};

export default React.memo(DataActionBarView);
