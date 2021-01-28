import React, { useCallback, useState } from "react";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import {
	Route,
	RouteChildrenProps,
	Switch,
	useRouteMatch,
	useHistory,
	useLocation,
} from "react-router-dom";
import BackendDataGrid, { BackendDataGridProps } from "../DataGrid";
import { Form, FormProps } from "../Form";
import { hasPermission, usePermissionContext } from "../../framework";
import { makeStyles } from "@material-ui/core/styles";

export interface CrudProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> {
	/**
	 * The model to use
	 */
	model: Model<KeyT, VisibilityT, CustomT>;
	/**
	 * The properties to pass to form
	 */
	formProps: Omit<
		FormProps<KeyT, VisibilityT, CustomT>,
		"id" | "model" | "children"
	>;
	/**
	 * The renderer function which returns the form component
	 * @param goBack Closes the form page
	 */
	children: (
		goBack: () => void
	) => FormProps<KeyT, VisibilityT, CustomT>["children"];
	/**
	 * The properties to pass to grid
	 */
	gridProps: Omit<
		BackendDataGridProps<KeyT, VisibilityT, CustomT>,
		| "model"
		| "enableDelete"
		| "disableExport"
		| "onEdit"
		| "onAddNew"
		| "forceRefreshToken"
	>;
	/**
	 * The delete record permission
	 */
	deletePermission: string;
	/**
	 * The edit record permission
	 */
	editPermission: string;
	/**
	 * The create new record permission
	 */
	newPermission: string;
	/**
	 * The export records permission
	 */
	exportPermission: string;
	/**
	 * Disables routing and uses an internal state instead (useful for dialogs)
	 */
	disableRouting?: boolean;
	/**
	 * If routing is disabled: set the initial view (id, "new" or null), defaults to null
	 */
	initialView?: string | null;
}

const useStyles = makeStyles({
	hide: {
		display: "none",
		width: "100%",
		height: "100%",
	},
	show: {
		width: "100%",
		height: "100%",
	},
});

const CRUD = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	props: CrudProps<KeyT, VisibilityT, CustomT>
) => {
	const history = useHistory();
	const { path } = useRouteMatch();
	const location = useLocation();
	const [perms] = usePermissionContext();
	const { disableRouting } = props;
	const [id, setId] = useState<string | null>(props.initialView ?? null);
	const [gridRefreshToken, setGridRefreshToken] = useState<string>(
		new Date().getTime().toString()
	);
	const classes = useStyles();

	const showEditPage = useCallback(
		(id: string) => {
			if (disableRouting) {
				setId(id);
			} else {
				history.push(`${path}/${id}`);
			}
		},
		[history, path, disableRouting]
	);

	const showNewPage = useCallback(() => {
		if (disableRouting) {
			setId("new");
		} else {
			history.push(`${path}/new`);
		}
	}, [history, path, disableRouting]);

	const showOverview = useCallback(() => {
		if (disableRouting) {
			setId(null);
		} else {
			history.push(path);
		}
	}, [history, path, disableRouting]);

	const handleSubmit = useCallback(
		(data: Record<KeyT, unknown>) => {
			if (props.formProps.onSubmit) {
				props.formProps.onSubmit(data);
			}
			setGridRefreshToken(new Date().getTime().toString());
		},
		[props.formProps]
	);

	const grid = () => (
		<BackendDataGrid
			enableDelete={hasPermission(perms, props.deletePermission)}
			disableExport={!hasPermission(perms, props.exportPermission)}
			{...props.gridProps}
			model={props.model}
			forceRefreshToken={gridRefreshToken}
			onEdit={
				hasPermission(perms, props.editPermission) ? showEditPage : undefined
			}
			onAddNew={
				hasPermission(perms, props.editPermission) ? showNewPage : undefined
			}
		/>
	);

	const form = (id: string) => (
		<Form
			id={id === "new" ? null : id}
			model={props.model}
			{...props.formProps}
			onSubmit={handleSubmit}
		>
			{props.children(showOverview)}
		</Form>
	);

	return disableRouting ? (
		<>
			<div className={id !== null ? classes.hide : classes.show}>{grid()}</div>
			{id !== null && form(id)}
		</>
	) : (
		<>
			<div className={location.pathname === path ? classes.show : classes.hide}>
				{grid()}
			</div>
			<Switch>
				<Route path={`${path}/:id`} exact>
					{(routeProps: RouteChildrenProps<{ id: string }>) =>
						form(routeProps.match?.params.id ?? "")
					}
				</Route>
			</Switch>
		</>
	);
};

export default React.memo(CRUD) as typeof CRUD;
