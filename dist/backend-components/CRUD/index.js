import React, { Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import BackendDataGrid from "../DataGrid";
import { Form } from "../Form";
import { hasPermission, usePermissionContext, } from "../../framework";
import Loader from "../../standalone/Loader";
import throwError from "../../utils/throwError";
import useNavigate from "../../standalone/Routes/useNavigate";
import Route, { RouteContext } from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";
import useParams from "../../standalone/Routes/useParams";
import Routes from "../../standalone/Routes/Routes";
import { styled } from "@mui/material";
import DialogContextProvider from "../../framework/DialogContextProvider";
const CrudImport = React.lazy(() => import("./Import"));
const GridVisibilityWrapper = styled("div", {
    name: "CcCrud",
    slot: "gridWrapper",
})({
    width: "100%",
    height: "100%",
    "&.Mui-hidden": {
        display: "none",
    },
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
        return React.createElement(React.Fragment, null);
    return (React.createElement(Suspense, { fallback: React.createElement(Loader, null) }, props.form(params.id ?? "", props.children)));
};
const CRUD = (props) => {
    const navigate = useNavigate();
    const routeCtx = useContext(RouteContext);
    if (!props.disableRouting && !routeCtx)
        throw new Error("no route match");
    const routeUrl = routeCtx ? routeCtx.url : "";
    const location = useLocation();
    const [perms] = usePermissionContext();
    const { disableRouting, disableBackgroundGrid, forbiddenPage: ForbiddenPage, enableUserImport: requestEnableUserImport, importConfig, importUpdateKey, importHowTo, importUpdateKeyAdditionalFilters, importValidate, goBackCallback, } = props;
    const hasImportPermission = !importUpdateKey ||
        (hasPermission(perms, props.editPermission) &&
            hasPermission(perms, props.newPermission));
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
    const handleSubmit = useCallback(async (data, submit, old) => {
        // redirect to edit page
        const { id } = data;
        skipNextFormIdReset.current = id;
        if (disableRouting) {
            setId((oldId) => (oldId === null ? null : id));
        }
        else if (location.pathname.startsWith(routeUrl + "/new") ||
            location.pathname.startsWith(routeUrl + "/new/")) {
            navigate(`${routeUrl}/${id}`, { replace: true });
        }
        refreshGrid();
        if (props.formProps.onSubmit) {
            await props.formProps.onSubmit(data, submit, old);
        }
    }, [
        props.formProps,
        disableRouting,
        location.pathname,
        navigate,
        routeUrl,
        refreshGrid,
    ]);
    const handleImportButton = useCallback(() => {
        if (disableRouting) {
            setId("import");
        }
        else {
            navigate(`${routeUrl}/import`);
        }
    }, [disableRouting, navigate, routeUrl]);
    const MyBackendDataGrid = props.gridComponent ?? BackendDataGrid;
    const grid = (globalScrollListener) => (React.createElement(Suspense, { fallback: React.createElement(Loader, null) },
        React.createElement(GridWrapper, null,
            React.createElement(MyBackendDataGrid, { enableDelete: hasPermission(perms, props.deletePermission), disableDeleteHint: props.deletePermissionHint, disableExport: !hasPermission(perms, props.exportPermission), ...props.gridProps, model: props.model, forceRefreshToken: gridRefreshToken, onEdit: (hasPermission(perms, props.readPermission) ||
                    hasPermission(perms, props.editPermission)) &&
                    props.children
                    ? showEditPage
                    : undefined, onAddNew: props.gridProps.forceAddNew ??
                    (hasPermission(perms, props.newPermission) && props.children
                        ? props.gridProps.onAddNew == null
                            ? showNewPage
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
                        : props.newPermissionHint), onImport: enableUserImport ? handleImportButton : undefined, globalScrollListener: globalScrollListener }))));
    const importer = (guided) => (React.createElement(ImportUI, { model: props.model, importConfig: importConfig, updateKey: importUpdateKey, updateKeyAdditionalFilters: importUpdateKeyAdditionalFilters, howTo: importHowTo, validate: importValidate, guided: guided }));
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
        return (React.createElement(DialogContextProvider, null,
            React.createElement(Form, { id: id === "new" ? null : id, key: formKey.current, model: props.model, ...props.formProps, readOnlyReasons: {
                    ...props.formProps.readOnlyReasons,
                    ...(!hasPermission(perms, id === "new" ? props.newPermission : props.editPermission) && { permissions: props.editPermissionHint ?? null }),
                }, onSubmit: handleSubmit, disableRouting: disableRouting, customProps: props.formProps.customProps ?? {
                    goBack: showOverview,
                    open: openView,
                    hasCustomSubmitHandler: props.formProps.onSubmit != null,
                } }, formComponent)));
    };
    const dispatch = useMemo(() => ({
        refreshGrid,
        openView,
        showOverview,
    }), [refreshGrid, openView, showOverview]);
    const showGrid = disableRouting
        ? id === null
        : routeUrl === location.pathname;
    useEffect(() => {
        window.dispatchEvent(new UIEvent("resize", { bubbles: true })); // trigger size recalculations
    }, [showGrid]);
    return (React.createElement(CrudDispatchContext.Provider, { value: dispatch }, disableRouting ? (React.createElement(React.Fragment, null,
        (id === null || !disableBackgroundGrid) && (React.createElement(GridVisibilityWrapper, { className: !showGrid ? "Mui-hidden" : undefined }, grid(id === null))),
        id === "import" && importer(true),
        id === "devimport" && importer(false),
        id !== null &&
            id !== "import" &&
            id !== "devimport" &&
            props.children &&
            form(id, props.children))) : (React.createElement(React.Fragment, null,
        (id === null || !disableBackgroundGrid) && (React.createElement(GridVisibilityWrapper, { className: !showGrid ? "Mui-hidden" : undefined }, grid(routeUrl === location.pathname))),
        props.children && (React.createElement(Routes, null,
            React.createElement(RouteComponent, { path: `import/*`, element: hasImportPermission || !ForbiddenPage ? (importer(true)) : (React.createElement(ForbiddenPage, null)) }),
            React.createElement(RouteComponent, { path: `devimport/*`, element: hasImportPermission || !ForbiddenPage ? (importer(false)) : (React.createElement(ForbiddenPage, null)) }),
            React.createElement(RouteComponent, { path: `:id/*`, element: hasPermission(perms, props.readPermission) ||
                    hasPermission(perms, props.editPermission) ||
                    hasPermission(perms, props.newPermission) ||
                    !ForbiddenPage ? (React.createElement(FormPageWrapper, { form: form }, props.children)) : (React.createElement(ForbiddenPage, null)) })))))));
};
export default React.memo(CRUD);
