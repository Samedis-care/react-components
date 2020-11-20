import React, { useCallback } from "react";
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
} from "react-router-dom";
import BackendDataGrid, { BackendDataGridProps } from "../DataGrid";
import { Form, FormProps } from "../Form";
import { hasPermission, usePermissionContext } from "../../framework";

export interface CrudProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> {
	model: Model<KeyT, VisibilityT, CustomT>;
	formProps: Omit<FormProps, "id" | "model" | "children">;
	children: FormProps["children"];
	gridProps: Omit<
		BackendDataGridProps<KeyT, VisibilityT, CustomT>,
		"model" | "enableDelete" | "disableExport" | "onEdit" | "onAddNew"
	>;
	deletePermission: string;
	editPermission: string;
	newPermission: string;
	exportPermission: string;
}

const CRUD = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	props: CrudProps<KeyT, VisibilityT, CustomT>
) => {
	const history = useHistory();
	const { path } = useRouteMatch();
	const [perms] = usePermissionContext();

	const showEditPage = useCallback(
		(id: string) => {
			history.push(`${path}/${id}`);
		},
		[history, path]
	);

	const showNewPage = useCallback(() => {
		history.push(`${path}/new`);
	}, [history, path]);

	return (
		<Switch>
			<Route path={`${path}`} exact>
				<BackendDataGrid
					model={props.model}
					enableDelete={hasPermission(perms, props.deletePermission)}
					disableExport={!hasPermission(perms, props.exportPermission)}
					onEdit={
						hasPermission(perms, props.editPermission)
							? showEditPage
							: undefined
					}
					onAddNew={
						hasPermission(perms, props.editPermission) ? showNewPage : undefined
					}
					{...props.gridProps}
				/>
			</Route>
			<Route path={`${path}/:id`} exact>
				{(routeProps: RouteChildrenProps<{ id: string }>) => (
					<Form
						id={
							routeProps.match?.params.id === "new"
								? null
								: routeProps.match?.params.id
						}
						model={props.model}
						{...props.formProps}
					>
						{props.children}
					</Form>
				)}
			</Route>
		</Switch>
	);
};

export default React.memo(CRUD) as typeof CRUD;
