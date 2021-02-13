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
import {
	hasPermission,
	Permission,
	usePermissionContext,
} from "../../framework";
import { makeStyles } from "@material-ui/core/styles";

export interface CrudFormProps {
	/**
	 * Callback for closing the form page
	 */
	goBack: () => void;
}

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
		FormProps<KeyT, VisibilityT, CustomT, CrudFormProps>,
		"id" | "model" | "children" | "customProps"
	>;
	/**
	 * The renderer function which returns the form component
	 */
	children: FormProps<KeyT, VisibilityT, CustomT, CrudFormProps>["children"];
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
	deletePermission: Permission;
	/**
	 * The edit record permission
	 */
	editPermission: Permission;
	/**
	 * The create new record permission
	 */
	newPermission: Permission;
	/**
	 * The export records permission
	 */
	exportPermission: Permission;
	/**
	 * Disables routing and uses an internal state instead (useful for dialogs)
	 */
	disableRouting?: boolean;
	/**
	 * If routing is disabled: set the initial view (id, "new" or null), defaults to null
	 */
	initialView?: string | null;
}

const useStyles = makeStyles(
	{
		hide: {
			display: "none",
			width: "100%",
			height: "100%",
		},
		show: {
			width: "100%",
			height: "100%",
		},
	},
	{ name: "CcCrud" }
);

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
		async (data: Record<KeyT, unknown>) => {
			if (props.formProps.onSubmit) {
				await props.formProps.onSubmit(data);
			}

			// redirect to edit page
			const { id } = data as Record<"id", string>;
			if (disableRouting) {
				setId((oldId) => (oldId === null ? null : id));
			} else if (location.pathname.endsWith("/new")) {
				history.push(`${path}/${id}`);
			}

			// cause grid refresh
			setGridRefreshToken(new Date().getTime().toString());
		},
		[props.formProps, disableRouting, location.pathname, history, path]
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
			customProps={{
				goBack: showOverview,
			}}
		>
			{props.children}
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
