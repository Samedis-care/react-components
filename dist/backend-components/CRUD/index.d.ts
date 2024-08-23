import React from "react";
import Model, { ModelFieldName, PageVisibility } from "../../backend-integration/Model/Model";
import { BackendDataGridProps } from "../DataGrid";
import { FormProps } from "../Form";
import { Permission } from "../../framework";
import { CrudImportProps } from "./Import";
import { IDataGridAddButton } from "../../standalone/DataGrid/DataGrid";
import { RouteProps } from "../../standalone/Routes/Route";
export interface CrudFormProps {
    /**
     * Callback for closing the form page
     * @param forceGridRefresh force grid refresh? (default false)
     */
    goBack: (forceGridRefresh?: boolean) => void;
    /**
     * Open view
     * @param id The ID of the record or special values for special views
     * @param forceRefresh force refresh data grid?
     * @see CrudSpecialIds
     */
    open: (id: "import" | "devimport" | "new" | string, forceRefresh?: boolean) => void;
    /**
     * Does the Form have a custom submit handler?
     */
    hasCustomSubmitHandler: boolean;
}
export interface GridWrapperProps {
    children: React.ReactNode;
}
export interface CrudProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> {
    /**
     * The model to use
     */
    model: Model<KeyT, VisibilityT, CustomT>;
    /**
     * The properties to pass to form
     */
    formProps: Omit<FormProps<KeyT, VisibilityT, CustomT, CrudFormProps>, "id" | "model" | "children" | "customProps" | "disableRouting" | "readOnly" | "readOnlyReason"> & {
        /**
         * override for default form custom props passed in by CRUD component
         */
        customProps?: FormProps<KeyT, VisibilityT, CustomT, CrudFormProps>["customProps"];
    };
    /**
     * The renderer function which returns the form component
     * @remarks Can be set to undefined to only render the Grid
     */
    children: FormProps<KeyT, VisibilityT, CustomT, CrudFormProps>["children"] | undefined;
    /**
     * The properties to pass to grid
     * @remarks onAddNew can be used to overCrudImportTypewrite the new button action
     */
    gridProps: Omit<BackendDataGridProps<KeyT, VisibilityT, CustomT>, "model" | "enableDelete" | "disableExport" | "onEdit" | "forceRefreshToken" | "onAddNew"> & Pick<Partial<BackendDataGridProps<KeyT, VisibilityT, CustomT>>, never> & {
        onAddNew?: ((showNew: () => void) => void) | string | (Omit<IDataGridAddButton, "onClick"> & {
            onClick: ((showNew: () => void) => void) | undefined;
        })[];
        forceAddNew?: BackendDataGridProps<KeyT, VisibilityT, CustomT>["onAddNew"];
    };
    /**
     * Component wrapping the DataGrid
     */
    gridWrapper?: React.ComponentType<GridWrapperProps>;
    /**
     * Custom BackendDataGrid component
     */
    gridComponent?: React.ComponentType<BackendDataGridProps<KeyT, VisibilityT, CustomT>>;
    /**
     * The record delete permission
     */
    deletePermission: Permission;
    /**
     * Hint as to why delete permissions are not granted
     */
    deletePermissionHint?: string;
    /**
     * The view permission (shows form in read-only mode if edit permission is not present)
     * Set to `false` to only show the form page if edit permissions are present
     */
    readPermission: Permission;
    /**
     * The record edit permission
     */
    editPermission: Permission;
    /**
     * Hint as to why edit permissions are not granted
     */
    editPermissionHint?: string;
    /**
     * The record create permission
     */
    newPermission: Permission;
    /**
     * Hint as to why create new permissions are not granted
     */
    newPermissionHint?: string;
    /**
     * The records export permission
     */
    exportPermission: Permission;
    /**
     * Disables routing and uses an internal state instead (useful for dialogs)
     */
    disableRouting?: boolean;
    /**
     * Unmounts the grid when showing form. Resets scroll in grid when coming back from form.
     * Useful for performance optimization or dialog handling where no Grid is shown
     */
    disableBackgroundGrid?: boolean;
    /**
     * If routing is disabled: set the initial view (id, "new", "import" or null), defaults to null
     */
    initialView?: string | null;
    /**
     * Forbidden page to show if the user navigated to a URL he has no permissions for
     * If not set: Shows edit form in read-only mode
     */
    forbiddenPage?: React.ComponentType;
    /**
     * Route component to use
     */
    routeComponent?: React.ComponentType<RouteProps>;
    /**
     * Enable Import button in Grid
     */
    enableUserImport?: boolean;
    /**
     * Import config (should be set if enableUserImport set)
     */
    importConfig?: CrudImportProps<KeyT, VisibilityT, CustomT>["importConfig"];
    /**
     * Import update key (primary key substitute)
     */
    importUpdateKey?: CrudImportProps<KeyT, VisibilityT, CustomT>["updateKey"];
    /**
     * Additional filters to be sent when doing update key index requests
     */
    importUpdateKeyAdditionalFilters?: CrudImportProps<KeyT, VisibilityT, CustomT>["updateKeyAdditionalFilters"];
    /**
     * How-to information for the import
     */
    importHowTo?: CrudImportProps<KeyT, VisibilityT, CustomT>["howTo"];
    /**
     * Additional record validation for imported records
     */
    importValidate?: CrudImportProps<KeyT, VisibilityT, CustomT>["validate"];
    /**
     * Custom Import UI
     */
    importUI?: React.ComponentType<CrudImportProps<KeyT, VisibilityT, CustomT>>;
    /**
     * Callback called when goBack is called in form (returning from form to data grid)
     */
    goBackCallback?: () => void;
}
export interface CRUDGridVisibilityWrapperOwnerState {
    hidden: boolean;
}
export interface CrudDispatch {
    /**
     * Force-refreshes the grid
     */
    refreshGrid: () => void;
}
export declare const useCrudDispatchContext: () => CrudDispatch;
export declare const CrudSpecialIds: string[];
declare const CRUD: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(props: CrudProps<KeyT, VisibilityT, CustomT>) => React.JSX.Element;
declare const _default: typeof CRUD;
export default _default;
