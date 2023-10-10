import React, { Suspense, useCallback, useContext, useMemo, useRef, useState, } from "react";
import { Route, useLocation, useNavigate, useParams } from "react-router-dom";
import BackendDataGrid from "../DataGrid";
import { Form } from "../Form";
import { hasPermission, usePermissionContext, } from "../../framework";
import makeStyles from "@mui/styles/makeStyles";
import Loader from "../../standalone/Loader";
import { throwError, useRouteInfo } from "../../utils";
import { SentryRoutes } from "../../standalone/SentryRoute";
const CrudImport = React.lazy(() => import("./Import"));
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
}, { name: "CcCrud" });
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
    return props.form(params.id ?? "", props.children);
};
const CRUD = (props) => {
    const navigate = useNavigate();
    const { url: routeUrl } = useRouteInfo(props.disableRouting);
    const location = useLocation();
    const [perms] = usePermissionContext();
    const { disableRouting, disableBackgroundGrid, forbiddenPage: ForbiddenPage, enableUserImport: requestEnableUserImport, importConfig, importUpdateKey, importHowTo, importUpdateKeyAdditionalFilters, importValidate, } = props;
    const hasImportPermission = !importUpdateKey ||
        (hasPermission(perms, props.editPermission) &&
            hasPermission(perms, props.newPermission));
    const enableUserImport = requestEnableUserImport && hasImportPermission;
    const GridWrapper = props.gridWrapper ?? React.Fragment;
    const RouteComponent = props.routeComponent ?? Route;
    const ImportUI = props.importUI ?? CrudImport;
    const [id, setId] = useState(props.initialView ?? null);
    const [gridRefreshToken, setGridRefreshToken] = useState(new Date().getTime().toString());
    const classes = useStyles();
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
        if (disableRouting) {
            setId(null);
        }
        else {
            navigate(routeUrl);
        }
        if (forceRefresh)
            refreshGrid();
    }, [disableRouting, refreshGrid, navigate, routeUrl]);
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
    const grid = (globalScrollListener) => (React.createElement(Suspense, { fallback: React.createElement(Loader, null) },
        React.createElement(GridWrapper, null,
            React.createElement(BackendDataGrid, { enableDelete: hasPermission(perms, props.deletePermission), disableDeleteHint: props.deletePermissionHint, disableExport: !hasPermission(perms, props.exportPermission), ...props.gridProps, model: props.model, forceRefreshToken: gridRefreshToken, onEdit: (hasPermission(perms, props.readPermission) ||
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
        return (React.createElement(Form, { id: id === "new" ? null : id, key: formKey.current, model: props.model, ...props.formProps, readOnlyReasons: {
                ...props.formProps.readOnlyReasons,
                ...(!hasPermission(perms, id === "new" ? props.newPermission : props.editPermission) && { permissions: props.editPermissionHint ?? null }),
            }, onSubmit: handleSubmit, disableRouting: disableRouting, customProps: props.formProps.customProps ?? {
                goBack: showOverview,
                open: openView,
                hasCustomSubmitHandler: props.formProps.onSubmit != null,
            } }, formComponent));
    };
    const dispatch = useMemo(() => ({
        refreshGrid,
    }), [refreshGrid]);
    return (React.createElement(CrudDispatchContext.Provider, { value: dispatch }, disableRouting ? (React.createElement(React.Fragment, null,
        (id === null || !disableBackgroundGrid) && (React.createElement("div", { className: id !== null ? classes.hide : classes.show }, grid(id === null))),
        id === "import" && importer(true),
        id === "devimport" && importer(false),
        id !== null &&
            id !== "import" &&
            id !== "devimport" &&
            props.children &&
            form(id, props.children))) : (React.createElement(React.Fragment, null,
        (id === null || !disableBackgroundGrid) && (React.createElement("div", { className: location.pathname === routeUrl ? classes.show : classes.hide }, grid(location.pathname === routeUrl))),
        props.children && (React.createElement(SentryRoutes, null,
            React.createElement(RouteComponent, { path: `import/*`, element: hasImportPermission || !ForbiddenPage ? (importer(true)) : (React.createElement(ForbiddenPage, null)) }),
            React.createElement(RouteComponent, { path: `devimport/*`, element: hasImportPermission || !ForbiddenPage ? (importer(false)) : (React.createElement(ForbiddenPage, null)) }),
            React.createElement(RouteComponent, { path: `:id/*`, element: hasPermission(perms, props.readPermission) ||
                    hasPermission(perms, props.editPermission) ||
                    hasPermission(perms, props.newPermission) ||
                    !ForbiddenPage ? (React.createElement(FormPageWrapper, { form: form }, props.children)) : (React.createElement(ForbiddenPage, null)) })))))));
};
export default React.memo(CRUD);
