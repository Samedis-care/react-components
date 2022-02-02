import React from "react";
import { Grid } from "@material-ui/core";
import { SmallIconButton, VerticalDivider } from "../../index";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import { Edit as EditIcon, Delete as DeleteIcon } from "@material-ui/icons";
import SelectAll from "./SelectAll";
import { DataGridProps, useDataGridStyles } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	const classes = useDataGridStyles();
	const { t } = useCCTranslations();

	return (
		<Grid container wrap={"nowrap"}>
			<Grid item key={"select-all"}>
				<ComponentWithLabel
					control={<SelectAll />}
					labelText={t("standalone.data-grid.footer.select-all")}
					labelPlacement={"bottom"}
					className={classes.selectAllWrapper}
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
			{props.handleDelete && (
				<>
					<Grid item key={"divider-2"}>
						<VerticalDivider />
					</Grid>
					<Grid item key={"delete"}>
						<ComponentWithLabel
							control={
								<SmallIconButton
									color={"primary"}
									disabled={props.numSelected === 0}
									onClick={props.handleDelete}
								>
									<DeleteIcon />
								</SmallIconButton>
							}
							labelText={t("standalone.data-grid.footer.delete")}
							labelPlacement={"bottom"}
							disabled={props.numSelected === 0}
						/>
					</Grid>
				</>
			)}
			{props.customButtons?.map((entry) => (
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
			))}
		</Grid>
	);
};

export default React.memo(DataActionBarView);
