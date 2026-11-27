import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useContext, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, } from "react";
import BackendDataGrid from "../DataGrid";
import { Form } from "../Form";
import { FORM_PAGE_MOVE_STATE } from "../Form/FormPageGuard";
import { hasPermission, usePermissionContext, } from "../../framework";
import Loader from "../../standalone/Loader";
import throwError from "../../utils/throwError";
import focusContainer from "../../utils/internal/focusContainer";
import useNavigate from "../../standalone/Routes/useNavigate";
import { useHistoryRouterContext } from "../../standalone/Routes/HistoryRouter";
import Route, { RouteContext } from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";
import useParams from "../../standalone/Routes/useParams";
import Routes from "../../standalone/Routes/Routes";
import { styled } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";
import DialogContextProvider from "../../framework/DialogContextProvider";
import useCCTranslations from "../../utils/useCCTranslations";
const CrudImport = React.lazy(() => import("./Import"));
const GridVisibilityWrapper = styled("div", {
    name: "CcCrud",
    slot: "gridWrapper",
})({
    width: "100%",
    height: "100%",
    // takes the focus when the list comes back without a control to return it to, as long
    // as it has it (tabindex -1, not a tab stop): no focus ring
    outline: "none",
    "&.Mui-hidden": {
        display: "none",
    },
});
const ViewWrapper = styled("div", {
    name: "CcCrud",
    slot: "view",
})({
    width: "100%",
    height: "100%",
    // takes the focus when the view opens, as long as it has it (tabindex -1, not a tab
    // stop): no focus ring
    outline: "none",
});
const CrudDispatchContext = React.createContext(undefined);
export const useCrudDispatchContext = () => {
    const ctx = useContext(CrudDispatchContext);
    if (!ctx)
        throw new Error("CrudDispatchContext not set");
    return ctx;
};
export const CrudSpecialIds = ["import", "devimport", "new"];
const FormPageWrapper = (props) => {
    const params = useParams();
    if (!props.children)
        return _jsx(_Fragment, {});
    return (_jsx(Suspense, { fallback: _jsx(Loader, {}), children: props.form(params.id ?? "", props.children) }));
};
/**
 * A location pathname in the form of a route's url, which has no trailing or repeated slashes
 * @param pathname The pathname
 */
const toRouteUrl = (pathname) => "/" +
    pathname
        .split("/")
        .filter((segment) => segment)
        .join("/");
/**
 * The view a routed CRUD shows
 * @param pathname The location pathname
 * @param routeUrl The url of the CRUD's route
 * @returns null for the list, else the first segment below the CRUD's url: a record id,
 *          "new", "import" or "devimport" (the record page's own sub-routes, e.g. tabs,
 *          are part of that view)
 */
const toRoutedView = (pathname, routeUrl) => {
    const path = toRouteUrl(pathname);
    if (path === routeUrl)
        return null;
    return (path
        .substring(routeUrl.length)
        .split("/")
        .find((segment) => segment) ?? "");
};
/**
 * Has the keyboard focus no place to stay after a view switch: on no element, on the page or
 * on a container around the element that is to take it (where it falls when the focused
 * element is removed), or inside the part of the CRUD that was just hidden?
 * @param target The element that is to take the focus
 * @param hidden The part of the CRUD that was hidden, if any
 */
const isFocusLost = (target, hidden) => {
    const active = target.ownerDocument.activeElement;
    if (active === target)
        return false;
    return !active || active.contains(target) || !!hidden?.contains(active);
};
const CRUD = (props, ref) => {
    const { t } = useCCTranslations();
    const navigate = useNavigate();
    const routeCtx = useContext(RouteContext);
    if (!props.disableRouting && !routeCtx)
        throw new Error("no route match");
    const routeUrl = routeCtx ? routeCtx.url : "";
    const location = useLocation();
    const [perms] = usePermissionContext();
    const { disableRouting, disableBackgroundGrid, forbiddenPage: ForbiddenPage, enableUserImport: requestEnableUserImport, enableDevImport, importConfig, importUpdateKey, importHowTo, importUpdateKeyAdditionalFilters, importValidate, goBackCallback, } = props;
    const hasImportPermission = (!importUpdateKey || hasPermission(perms, props.editPermission)) &&
        hasPermission(perms, props.newPermission);
    const enableUserImport = requestEnableUserImport && hasImportPermission;
    const GridWrapper = props.gridWrapper ?? React.Fragment;
    const RouteComponent = props.routeComponent ?? Route;
    const ImportUI = props.importUI ?? CrudImport;
    const [id, setId] = useState(props.initialView ?? null);
    const [gridRefreshToken, setGridRefreshToken] = useState(new Date().getTime().toString());
    const skipNextFormIdReset = useRef(null);
    const showEditPage = useCallback((id) => {
        if (disableRouting) {
            setId(id);
        }
        else {
            navigate(`${routeUrl}/${id}`);
        }
    }, [navigate, routeUrl, disableRouting]);
    const showNewPage = useCallback(() => {
        if (disableRouting) {
            setId("new");
        }
        else {
            navigate(`${routeUrl}/new`);
        }
    }, [navigate, routeUrl, disableRouting]);
    const refreshGrid = useCallback(() => {
        setGridRefreshToken(new Date().getTime().toString());
    }, []);
    const gridRef = useRef(null);
    const getGridQuery = useCallback(() => gridRef.current?.getQuery(), []);
    const showOverview = useCallback((forceRefresh) => {
        if (goBackCallback)
            goBackCallback();
        if (disableRouting) {
            setId(null);
        }
        else {
            navigate(routeUrl);
        }
        if (forceRefresh)
            refreshGrid();
    }, [goBackCallback, disableRouting, refreshGrid, navigate, routeUrl]);
    const openView = useCallback((id, forceRefresh) => {
        if (disableRouting) {
            setId(id);
        }
        else {
            navigate(routeUrl + "/" + id);
        }
        if (forceRefresh)
            refreshGrid();
    }, [disableRouting, navigate, routeUrl, refreshGrid]);
    // a save resolves long after the render it started in: handleSubmit reads where the user
    // is then from these, as they may have left the create form while it saved
    const { history } = useHistoryRouterContext();
    const viewRef = useRef(id);
    viewRef.current = id;
    const mountedRef = useRef(false);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);
    const handleSubmit = useCallback(async (data, submit, old) => {
        // redirect to edit page, if the create form that was saved is still shown. A user
        // who left it while it saved (another record, the list, another page, a closed
        // view) stays where they went
        const { id } = data;
        const { pathname } = history.location;
        if (!mountedRef.current) {
            // the CRUD is gone, and the create form with it
        }
        else if (disableRouting) {
            if (viewRef.current === "new") {
                skipNextFormIdReset.current = id;
                // a view switch that has not rendered yet keeps its view
                setId((view) => (view === "new" ? id : view));
            }
        }
        else if (pathname.startsWith(routeUrl + "/new") ||
            pathname.startsWith(routeUrl + "/new/")) {
            // the saved record opens where the create form is, e.g. on the same
            // tab: <url>/new/permissions becomes <url>/<id>/permissions
            const subPath = pathname
                .substring(routeUrl.length)
                .split("/")
                .filter((segment) => segment)
                .slice(1);
            skipNextFormIdReset.current = id;
            // the Form stays (skipNextFormIdReset), so this moves the form page rather than
            // leaving it, and its leave guard lets it pass: a control's own dirty state may
            // not have caught up with the saved record yet. The user stays where they are
            // on the page, so the scroll position stays too.
            navigate([`${routeUrl}/${id}`, ...subPath].join("/"), {
                replace: true,
                state: FORM_PAGE_MOVE_STATE,
                preventScrollReset: true,
            });
        }
        refreshGrid();
        if (props.formProps.onSubmit) {
            await props.formProps.onSubmit(data, submit, old);
        }
    }, [props.formProps, disableRouting, history, navigate, routeUrl, refreshGrid]);
    const handleImportButton = useCallback(() => {
        if (disableRouting) {
            setId("import");
        }
        else {
            navigate(`${routeUrl}/import`);
        }
    }, [disableRouting, navigate, routeUrl]);
    const MyBackendDataGrid = props.gridComponent ?? BackendDataGrid;
    const grid = (globalScrollListener) => (_jsx(Suspense, { fallback: _jsx(Loader, {}), children: _jsx(GridWrapper, { children: _jsx(MyBackendDataGrid, { ref: gridRef, enableDelete: hasPermission(perms, props.deletePermission), disableDeleteHint: props.deletePermissionHint, disableExport: !hasPermission(perms, props.exportPermission), ...props.gridProps, model: props.model, forceRefreshToken: gridRefreshToken, onEdit: (hasPermission(perms, props.readPermission) ||
                    hasPermission(perms, props.editPermission)) &&
                    props.children
                    ? showEditPage
                    : undefined, editIcon: hasPermission(perms, props.editPermission) ? undefined : ViewIcon, editLabel: hasPermission(perms, props.editPermission)
                    ? undefined
                    : t("backend-components.crud.grid.view"), onAddNew: props.gridProps.forceAddNew ??
                    (hasPermission(perms, props.newPermission)
                        ? props.gridProps.onAddNew == null
                            ? // the default New opens the create form, which needs a record page
                                props.children
                                    ? showNewPage
                                    : undefined
                            : typeof props.gridProps.onAddNew === "string"
                                ? props.gridProps.onAddNew
                                : typeof props.gridProps.onAddNew === "function"
                                    ? () => props.gridProps.onAddNew(showNewPage)
                                    : Array.isArray(props.gridProps.onAddNew)
                                        ? props.gridProps.onAddNew.map((btn) => ({
                                            ...btn,
                                            onClick: btn.onClick
                                                ? () => btn.onClick(showNewPage)
                                                : undefined,
                                        }))
                                        : throwError("invalid type")
                        : props.newPermissionHint), onImport: enableUserImport ? handleImportButton : undefined, globalScrollListener: globalScrollListener }) }) }));
    const importer = (guided) => {
        // an import view exists only where the app enables it, routed or not: otherwise its
        // id is still reserved (no record page for it), and it is forbidden or empty
        const enabled = guided ? requestEnableUserImport : enableDevImport;
        if (!enabled || (!hasImportPermission && ForbiddenPage)) {
            return ForbiddenPage ? _jsx(ForbiddenPage, {}) : _jsx(_Fragment, {});
        }
        return (_jsx(ImportUI, { model: props.model, importConfig: importConfig, updateKey: importUpdateKey, updateKeyAdditionalFilters: importUpdateKeyAdditionalFilters, howTo: importHowTo, validate: importValidate, guided: guided }));
    };
    const lastFormId = useRef(null);
    const formKey = useRef(Date.now().toString(16));
    const form = (id, formComponent) => {
        // when we switch IDs (everything except from new -> id triggered by form submit) we reset form fully
        if (lastFormId.current == null)
            lastFormId.current = id;
        if (lastFormId.current !== id) {
            if (skipNextFormIdReset.current !== id) {
                formKey.current = Date.now().toString(16);
            }
            skipNextFormIdReset.current = null;
            lastFormId.current = id;
        }
        return (_jsx(DialogContextProvider, { children: _jsx(Form, { id: id === "new" ? null : id, model: props.model, ...props.formProps, readOnlyReasons: {
                    ...props.formProps.readOnlyReasons,
                    ...(!hasPermission(perms, id === "new" ? props.newPermission : props.editPermission) && { permissions: props.editPermissionHint ?? null }),
                }, onSubmit: handleSubmit, disableRouting: disableRouting, customProps: props.formProps.customProps ?? {
                    goBack: showOverview,
                    open: openView,
                    hasCustomSubmitHandler: props.formProps.onSubmit != null,
                }, children: formComponent }, formKey.current) }));
    };
    const dispatch = useMemo(() => ({
        refreshGrid,
        openView,
        showOverview,
        getGridQuery,
    }), [refreshGrid, openView, showOverview, getGridQuery]);
    useImperativeHandle(ref, () => dispatch, [dispatch]);
    // null for the list, else the id of the record page or importer
    const shownView = disableRouting
        ? id
        : toRoutedView(location.pathname, routeUrl);
    const showGrid = shownView === null;
    useEffect(() => {
        window.dispatchEvent(new UIEvent("resize", { bubbles: true })); // trigger size recalculations
    }, [showGrid]);
    // Keyboard focus on a view switch. Opening a view hides the list and with it the focused
    // Edit, New or Import; leaving a view removes the focused Back. Where the focus fell to
    // the page or into the hidden list, it moves on: back on the list to the control that had
    // it there last, else (and when a view opens) to the container of what is shown. Focus
    // the new view took itself (autoFocus) or that is outside the CRUD stays where it is.
    const gridWrapperRef = useRef(null);
    const viewWrapperRef = useRef(null);
    // the element in the list that had the focus last: the control that opened the view
    const gridFocusRef = useRef(null);
    const handleGridFocus = useCallback((evt) => {
        const target = evt.target;
        // a popup of the list is in a portal, outside of it: the control that opened the
        // popup stays the one to return to
        if (target === evt.currentTarget || !evt.currentTarget.contains(target))
            return;
        if (target instanceof HTMLElement)
            gridFocusRef.current = target;
    }, []);
    const focusedView = useRef(shownView);
    const focusCheckPending = useRef(false);
    // a layout effect: back on the list, the opener gets the focus before a HistoryRouter
    // moves it to the page heading after the navigation
    useLayoutEffect(() => {
        if (focusedView.current === shownView)
            return;
        focusedView.current = shownView;
        focusCheckPending.current = true;
        const gridWrapper = gridWrapperRef.current;
        const opener = gridFocusRef.current;
        if (!gridWrapper || !opener || !gridWrapper.contains(opener)) {
            // no opener, or one whose list was unmounted (disableBackgroundGrid)
            gridFocusRef.current = null;
            return;
        }
        if (shownView === null && isFocusLost(gridWrapper, null))
            opener.focus();
    }, [shownView]);
    // a passive effect, after the HistoryRouter's layout effect: a page heading it focused
    // keeps the focus. Then the container takes the focus if it still has no place: the
    // opener may be disabled or gone, and a view shows its content once it has loaded.
    useEffect(() => {
        if (!focusCheckPending.current)
            return;
        focusCheckPending.current = false;
        const gridWrapper = gridWrapperRef.current;
        const target = shownView === null ? gridWrapper : viewWrapperRef.current;
        if (!target)
            return;
        if (!isFocusLost(target, shownView === null ? null : gridWrapper))
            return;
        focusContainer(target);
    }, [shownView]);
    return (_jsx(CrudDispatchContext.Provider, { value: dispatch, children: disableRouting ? (_jsxs(_Fragment, { children: [(id === null || !disableBackgroundGrid) && (_jsx(GridVisibilityWrapper, { ref: gridWrapperRef, onFocus: handleGridFocus, className: !showGrid ? "Mui-hidden" : undefined, children: grid(id === null) })), id !== null && (_jsxs(ViewWrapper, { ref: viewWrapperRef, children: [id === "import" && importer(true), id === "devimport" && importer(false), id !== "import" &&
                            id !== "devimport" &&
                            props.children &&
                            form(id, props.children)] }))] })) : (_jsxs(_Fragment, { children: [(id === null || !disableBackgroundGrid) && (_jsx(GridVisibilityWrapper, { ref: gridWrapperRef, onFocus: handleGridFocus, className: !showGrid ? "Mui-hidden" : undefined, children: grid(showGrid) })), !showGrid && (_jsx(ViewWrapper, { ref: viewWrapperRef, children: props.children && (_jsxs(Routes, { children: [_jsx(RouteComponent, { path: `import/*`, element: importer(true) }), _jsx(RouteComponent, { path: `devimport/*`, element: importer(false) }), _jsx(RouteComponent, { path: `:id/*`, element: hasPermission(perms, props.readPermission) ||
                                    hasPermission(perms, props.editPermission) ||
                                    hasPermission(perms, props.newPermission) ||
                                    !ForbiddenPage ? (_jsx(FormPageWrapper, { form: form, children: props.children })) : (_jsx(ForbiddenPage, {})) })] })) }))] })) }));
};
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
export default React.memo(React.forwardRef(CRUD));
