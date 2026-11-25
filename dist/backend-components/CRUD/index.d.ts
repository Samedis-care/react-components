import React from "react";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import { BackendDataGridProps } from "../DataGrid";
import { FormProps } from "../Form";
import { Permission } from "../../framework";
import { CrudImportProps } from "./Import";
import { DataGridDispatch, DataGridQuery, IDataGridAddButton } from "../../standalone/DataGrid/DataGrid";
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
export interface CrudProps<M extends ModelUnknown> {
    /**
     * The model to use
     */
    model: M;
    /**
     * The properties to pass to form
     */
    formProps: Omit<FormProps<M, CrudFormProps>, "id" | "model" | "children" | "customProps" | "disableRouting" | "readOnly" | "readOnlyReason"> & {
        /**
         * override for default form custom props passed in by CRUD component
         */
        customProps?: FormProps<M, CrudFormProps>["customProps"];
    };
    /**
     * The page component of the record Form; it gets
     * `PageProps<M, CrudFormProps>`.
     * Pass `{undefined}` for a list without a record page: the grid then has
     * no Edit/View, and no default New (it would open the create form);
     * gridProps.onAddNew and gridProps.forceAddNew still apply.
     */
    children: FormProps<M, CrudFormProps>["children"] | undefined;
    /**
     * The properties to pass to the grid (BackendDataGrid, or gridComponent)
     * @remarks `onAddNew` replaces what the grid's New does; see onAddNew and
     *          forceAddNew below
     */
    gridProps: Omit<BackendDataGridProps<M>, "model" | "enableDelete" | "disableExport" | "onEdit" | "forceRefreshToken" | "onAddNew"> & Pick<Partial<BackendDataGridProps<M>>, never> & {
        /**
         * What the grid's New does, for users with newPermission (users
         * without it get newPermissionHint instead), with or without a record
         * page (`children`):
         * - not set: New opens the create form ("new"), and there is no New
         *   without a record page;
         * - a function: New calls it with `showNew`, which opens the create
         *   form (call it only with a record page);
         * - a string: a disabled New with this string as its tooltip;
         * - an array: one button per entry, whose onClick gets `showNew`
         *   (`onClick: undefined` disables the button).
         * Any other value throws "invalid type" while rendering.
         */
        onAddNew?: ((showNew: () => void) => void) | string | (Omit<IDataGridAddButton, "onClick"> & {
            onClick: ((showNew: () => void) => void) | undefined;
        })[];
        /**
         * Passed to the grid's onAddNew as it is, without the newPermission
         * check; replaces onAddNew and newPermissionHint when set
         */
        forceAddNew?: BackendDataGridProps<M>["onAddNew"];
    };
    /**
     * Component wrapping the DataGrid
     */
    gridWrapper?: React.ComponentType<GridWrapperProps>;
    /**
     * Custom BackendDataGrid component
     * @remarks It gets a ref, which it has to pass on to BackendDataGrid for
     *          CrudDispatch.getGridQuery
     */
    gridComponent?: React.ComponentType<BackendDataGridProps<M> & React.RefAttributes<DataGridDispatch>>;
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
     * Creating records: the grid's New (see gridProps.onAddNew), the "new"
     * view and the importer
     */
    newPermission: Permission;
    /**
     * For users without newPermission: the grid shows a disabled New with this
     * text as its tooltip. Without it they get no New. Users with
     * newPermission never see it.
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
    importConfig?: CrudImportProps<M>["importConfig"];
    /**
     * Import update key (primary key substitute)
     */
    importUpdateKey?: CrudImportProps<M>["updateKey"];
    /**
     * Additional filters to be sent when doing update key index requests
     */
    importUpdateKeyAdditionalFilters?: CrudImportProps<M>["updateKeyAdditionalFilters"];
    /**
     * How-to information for the import
     */
    importHowTo?: CrudImportProps<M>["howTo"];
    /**
     * Additional record validation for imported records
     */
    importValidate?: CrudImportProps<M>["validate"];
    /**
     * Custom Import UI
     */
    importUI?: React.ComponentType<CrudImportProps<M>>;
    /**
     * Callback called when goBack is called in form (returning from form to data grid)
     */
    goBackCallback?: () => void;
}
export interface CRUDGridVisibilityWrapperOwnerState {
    hidden: boolean;
}
export type CrudClassKey = "gridWrapper";
export interface CrudDispatch {
    /**
     * Force-refreshes the grid
     */
    refreshGrid: () => void;
    /**
     * Go back to datagrid
     * @param forceRefresh refresh grid, default false
     */
    showOverview: (forceRefresh?: boolean) => void;
    /**
     * Open view
     * @param id ID to open
     * @param forceRefresh force refresh grid, default false
     */
    openView: (id: "import" | "devimport" | "new" | string, forceRefresh?: boolean) => void;
    /**
     * The query the grid currently shows
     * @returns The query, see DataGridDispatch.getQuery, or undefined while the
     *          grid isn't mounted (disableBackgroundGrid with a form open) or
     *          if the gridComponent doesn't pass its ref on
     */
    getGridQuery: () => DataGridQuery | undefined;
}
export declare const useCrudDispatchContext: () => CrudDispatch;
export declare const CrudSpecialIds: string[];
export type CrudType = <M extends ModelUnknown>(props: CrudProps<M> & React.RefAttributes<CrudDispatch>) => React.ReactElement | null;
declare const _default: CrudType;
export default _default;
