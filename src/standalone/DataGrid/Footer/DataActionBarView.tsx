import React from "react";
import { Grid } from "@material-ui/core";
import { SmallIconButton, VerticalDivider } from "../../index";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import i18n from "../../../i18n";
import { Edit as EditIcon, Delete as DeleteIcon } from "@material-ui/icons";
import SelectAll from "./SelectAll";
import { useDataGridStyles } from "../DataGrid";

export interface DataActionBarViewProps {
	/**
	 * The amount of selected items
	 * Values: 0 (none), 1 (one) or 2 (multiple)
	 */
	numSelected: number;
	/**
	 * Callback for edit button.
	 * If not defined: Disables edit button
	 */
	handleEdit?: () => void;
	/**
	 * Callback for delete button.
	 * If not defined: Disables delete button
	 */
	handleDelete?: () => void;
}

const DataActionBarView = (props: DataActionBarViewProps) => {
	const classes = useDataGridStyles();

	return (
		<Grid container>
			<Grid item key={"select-all"}>
				<ComponentWithLabel
					control={<SelectAll />}
					labelText={i18n.t("standalone.data-grid.footer.select-all")}
					labelPlacement={"bottom"}
					className={classes.selectAllWrapper}
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
								>
									<EditIcon />
								</SmallIconButton>
							}
							labelText={i18n.t("standalone.data-grid.footer.edit")}
							onClick={props.handleEdit}
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
								>
									<DeleteIcon />
								</SmallIconButton>
							}
							labelText={i18n.t("standalone.data-grid.footer.delete")}
							onClick={props.handleDelete}
							labelPlacement={"bottom"}
							disabled={props.numSelected === 0}
						/>
					</Grid>
				</>
			)}
		</Grid>
	);
};

export default React.memo(DataActionBarView);
