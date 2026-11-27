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
     * @remarks `onSubmit` is wrapped. After a successful save of the create form,
     *          CRUD first moves on to the saved record, if the create form is
     *          still shown then: routed, it replaces `<url>/new…` with
     *          `<url>/<id>…` (the location when the save finishes, so a tab
     *          opened meanwhile stays open); with disableRouting, the "new" view
     *          becomes the saved id. A user who left the create form while it
     *          saved (another record, the list, another page, a closed view)
     *          stays there. Then CRUD reloads the grid and awaits this onSubmit,
     *          also when the user has left.
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
     * If routing is disabled: set the initial view (id, "new", "import", "devimport" or null), defaults to null
     */
    initialView?: string | null;
    /**
     * Forbidden page to show if the user navigated to a URL he has no permissions for,
     * and for an import view ("import" or "devimport", also with disableRouting) that is
     * not enabled (enableUserImport, enableDevImport) or that the user may not import in
     * (see enableUserImport)
     * If not set: Shows edit form in read-only mode and an enabled import view to every
     * user; an import view that is not enabled shows nothing
     */
    forbiddenPage?: React.ComponentType;
    /**
     * Route component to use
     */
    routeComponent?: React.ComponentType<RouteProps>;
    /**
     * Enables the import: the grid's Import, for users with newPermission (and
     * editPermission when importUpdateKey is set), and the view it opens,
     * `<url>/import` (with disableRouting the view "import"). Without it that
     * view does not exist: it shows forbiddenPage, or nothing.
     * @remarks The library's importer is the guided one with importConfig only;
     *          without importConfig it is the unguided one (see enableDevImport)
     * @default false
     */
    enableUserImport?: boolean;
    /**
     * Enables the unguided developer importer at `<url>/devimport` (with
     * disableRouting the view "devimport"), for users who may import (see
     * enableUserImport); the grid offers no button for it. Its Connect data step
     * runs the JavaScript the user types for each field, and its last step creates
     * (or updates) the records through the connector: a tool for developers
     * working out an importConfig, not for end users, e.g.
     * `enableDevImport={process.env.NODE_ENV === "development"}`. Without it
     * that view does not exist: it shows forbiddenPage, or nothing.
     * @default false
     */
    enableDevImport?: boolean;
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
/**
 * The theme slots of CRUD (`components.CcCrud.styleOverrides`):
 * - `gridWrapper`: the element around the grid (and gridWrapper); while another view
 *   shows it has the class `Mui-hidden` (display: none)
 * - `view`: the element around the record page or the importer, present while one of
 *   them shows
 * Both fill their parent (width and height 100%). When a view switch gives one of them the
 * keyboard focus, it has `tabindex="-1"` for as long as it keeps the focus, and no outline.
 */
export type CrudClassKey = "gridWrapper" | "view";
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
     *          grid isn't mounted (disableBackgroundGrid with a form open),
     *          while it waits for the state its persistence provider loads, or
     *          if the gridComponent doesn't pass its ref on
     */
    getGridQuery: () => DataGridQuery | undefined;
}
export declare const useCrudDispatchContext: () => CrudDispatch;
export declare const CrudSpecialIds: string[];
export type CrudType = <M extends ModelUnknown>(props: CrudProps<M> & React.RefAttributes<CrudDispatch>) => React.ReactElement | null;
/**
 * A model's list (BackendDataGrid) with a record page (a Form whose page component is
 * `children`) and an importer, each a view of its own: routed (the default) at the
 * Route's url and below it, with disableRouting in component state.
 *
 * The keyboard focus follows a view switch. When a record page (also "new") or the
 * importer opens and the focus was in the list, which is hidden then, or fell to the page,
 * the view's container (theme slot `view`) takes it, so the next Tab goes to the view's
 * first control. Back on the list, the control in it that had the focus last (the Edit,
 * View, New or Import that opened the view) gets it back; if that is gone or disabled, the
 * list's container (theme slot `gridWrapper`) takes it. Neither container is a tab stop.
 * Focus outside the CRUD (e.g. on a button that calls the ref's openView), focus the new
 * view moved itself (`autoFocus`), and the page heading a HistoryRouter focused after the
 * navigation stay where they are, and nothing moves on the first render.
 */
declare const _default: CrudType;
export default _default;
