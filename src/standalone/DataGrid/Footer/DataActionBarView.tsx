import React, { useCallback, useId, useState } from "react";
import {
	CircularProgress,
	MenuProps,
	styled,
	Tooltip,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { SmallestIconButton } from "../../Small";
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
import FocusableWhenDisabledIconButton from "./FocusableWhenDisabledIconButton";
import { dataGridIsCustomDataActionDisabled } from "../CallbackUtil";
import useMenuButton from "../../../utils/internal/useMenuButton";
import dataActionMargins from "./dataActionMargins";

export interface DataActionBarViewProps {
	/**
	 * The amount of selected items
	 * Values: 0 (none), 1 (one) or 2 (multiple)
	 */
	numSelected: 0 | 1 | 2;
	/**
	 * Is everything selected (the selection inverted)?
	 */
	selectAll: boolean;
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
	 * Is a delete running? Delete is then unavailable and shows a progress
	 * indicator in place of its icon, and the bar is busy (aria-busy)
	 * @see DataGridProps.deleting
	 */
	deleting: boolean;
	/**
	 * Does handleDelete handle an inverted selection? Otherwise the delete button
	 * is disabled while everything is selected
	 */
	enableDeleteAll: boolean;
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
	 * Hides the select all checkbox. It keeps its place, so the actions stay
	 * where they are, except on phones (only xs), where the bar needs the
	 * room. It is disabled then too, see selectAllDisabled
	 */
	disableSelection: boolean;
	/**
	 * The select all label: "All", or "First" and the limit while the limited
	 * select all selects only part of the rows matching the filter
	 */
	selectAllLabel: string;
	/**
	 * Is the select all checkbox disabled? Its caption is dimmed then, like
	 * the captions of the disabled actions
	 * @see DataGridSelectAll.disabled
	 */
	selectAllDisabled: boolean;
}

/**
 * The bar: its actions side by side, centred in its height, which is the
 * footer's. The dividers between them (VerticalDivider flexItem) run from its
 * top to its bottom.
 */
const DataActionBarRoot = styled("div")({
	display: "flex",
	alignItems: "center",
});

/**
 * Edit, Delete, More or a custom action. The select all checkbox
 * (DataGridSelectAllWrapper) has the same margins.
 */
const DataActionBarAction = styled(ComponentWithLabel)(({ theme }) =>
	dataActionMargins(theme),
);

/**
 * The element that shows the tooltip of an unavailable Delete: lays Delete
 * out in the bar like the other actions
 */
const DeleteHintAnchor = styled("span")({
	display: "flex",
});

const DataActionBarView = (props: DataActionBarViewProps) => {
	const { classes, editIcon, editLabel } = useDataGridProps();
	const { t } = useCCTranslations();
	const theme = useTheme();
	const isXs = useMediaQuery(theme.breakpoints.only("xs"));

	const MyEditIcon = editIcon ?? EditIcon;
	const myEditLabel = editLabel ?? t("standalone.data-grid.footer.edit");

	const [extendedMenuAnchor, setExtendedMenuAnchor] =
		useState<MenuProps["anchorEl"]>(undefined);
	const handleExtendedMenuOpen = useCallback((evt: React.MouseEvent) => {
		setExtendedMenuAnchor(evt.currentTarget);
	}, []);
	const handleExtendedMenuClose = useCallback(() => {
		setExtendedMenuAnchor(undefined);
	}, []);
	const extendedMenu = useMenuButton(!!extendedMenuAnchor);
	const deleteId = useId();

	const deleteDisabled =
		props.deleting ||
		props.numSelected === 0 ||
		!props.handleDelete ||
		(props.selectAll && !props.enableDeleteAll);
	// stays focusable while disabled: a delete clears the selection, which
	// disables Delete while it has keyboard focus
	const deleteBtn = (
		<DataActionBarAction
			control={
				<FocusableWhenDisabledIconButton
					id={deleteId}
					color={"primary"}
					disabled={deleteDisabled}
					onClick={props.handleDelete}
					aria-label={t("standalone.data-grid.footer.delete")}
				>
					{props.deleting ? (
						// named after the button, as MUI's IconButton names its loading indicator
						<CircularProgress
							size={20}
							color={"inherit"}
							aria-labelledby={deleteId}
						/>
					) : (
						<DeleteIcon />
					)}
				</FocusableWhenDisabledIconButton>
			}
			labelText={t("standalone.data-grid.footer.delete")}
			labelPlacement={"bottom"}
			disabled={deleteDisabled}
		/>
	);

	// On phones (only xs) the bar has to fit 320px: the hidden select all
	// takes no place there, and the custom actions are entries of "More" when
	// there are two or more, or when select all, Edit and Delete are in the bar
	// too (four actions and the count don't fit)
	const selectAllTakesPlace = !isXs || !props.disableSelection;
	const hasEdit = !!props.handleEdit;
	const hasDelete = !!(props.handleDelete || props.disableDeleteHint);
	const numCustomButtons = props.customButtons?.length ?? 0;
	const customButtonsInMenu =
		isXs &&
		(numCustomButtons > 1 ||
			(numCustomButtons === 1 && selectAllTakesPlace && hasEdit && hasDelete));
	// the dividers go between the actions: none before the first
	const dividerBeforeEdit = selectAllTakesPlace;
	const dividerBeforeDelete = dividerBeforeEdit || hasEdit;
	const dividerBeforeCustom = dividerBeforeDelete || hasDelete;

	const allCustomButtonsDisabled = !!props.customButtons?.every((entry) =>
		dataGridIsCustomDataActionDisabled(
			entry,
			props.numSelected,
			props.selectAll,
		),
	);

	return (
		<DataActionBarRoot aria-busy={props.deleting || undefined}>
			{selectAllTakesPlace && (
				<DataGridSelectAllWrapper
					control={<SelectAll />}
					labelText={props.selectAllLabel}
					labelPlacement={"bottom"}
					// the checkbox reads its disabled state from the select all
					// context, so the label can't take it from its control
					disabled={props.selectAllDisabled}
					className={classes?.selectAllWrapper}
					style={
						props.disableSelection
							? { opacity: 0, pointerEvents: "none" }
							: undefined
					}
				/>
			)}
			{hasEdit && (
				<>
					{dividerBeforeEdit && <VerticalDivider flexItem />}
					<DataActionBarAction
						control={
							<SmallestIconButton
								color={"primary"}
								disabled={props.numSelected !== 1}
								onClick={props.handleEdit}
								aria-label={myEditLabel}
							>
								<MyEditIcon />
							</SmallestIconButton>
						}
						labelText={myEditLabel}
						labelPlacement={"bottom"}
						disabled={props.numSelected !== 1}
					/>
				</>
			)}
			{hasDelete && (
				<>
					{dividerBeforeDelete && <VerticalDivider flexItem />}
					{!props.handleDelete && props.disableDeleteHint ? (
						<Tooltip title={props.disableDeleteHint}>
							<DeleteHintAnchor>{deleteBtn}</DeleteHintAnchor>
						</Tooltip>
					) : (
						deleteBtn
					)}
				</>
			)}
			{customButtonsInMenu && props.customButtons ? (
				<React.Fragment key={"custom-buttons-menu"}>
					{dividerBeforeCustom && <VerticalDivider flexItem />}
					<DataActionBarAction
						control={
							<SmallestIconButton
								{...extendedMenu.buttonProps}
								color={"primary"}
								disabled={allCustomButtonsDisabled}
								onClick={handleExtendedMenuOpen}
								aria-label={t("standalone.data-grid.footer.more")}
							>
								<MenuIcon />
							</SmallestIconButton>
						}
						labelText={t("standalone.data-grid.footer.more")}
						labelPlacement={"bottom"}
						disabled={allCustomButtonsDisabled}
					/>
					<DataActionBarMenu
						numSelected={props.numSelected}
						selectAll={props.selectAll}
						anchorEl={extendedMenuAnchor}
						onClose={handleExtendedMenuClose}
						customButtons={props.customButtons}
						handleCustomButtonClick={props.handleCustomButtonClick}
						slotProps={extendedMenu.slotProps}
					/>
				</React.Fragment>
			) : (
				props.customButtons?.map((entry, index) => {
					const disabled = dataGridIsCustomDataActionDisabled(
						entry,
						props.numSelected,
						props.selectAll,
					);
					return (
						<React.Fragment key={entry.label}>
							{(index > 0 || dividerBeforeCustom) && (
								<VerticalDivider flexItem />
							)}
							<DataActionBarAction
								control={
									<SmallestIconButton
										color={"primary"}
										disabled={disabled}
										onClick={() => {
											props.handleCustomButtonClick(entry.label);
										}}
										aria-label={entry.label}
									>
										{entry.icon}
									</SmallestIconButton>
								}
								labelText={entry.label}
								labelPlacement={"bottom"}
								disabled={disabled}
							/>
						</React.Fragment>
					);
				})
			)}
		</DataActionBarRoot>
	);
};

export default React.memo(DataActionBarView);
