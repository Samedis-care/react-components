var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { Suspense, useCallback, useContext, useMemo, useRef, useState, } from "react";
import { Route, useLocation, useNavigate, useParams } from "react-router-dom";
import BackendDataGrid from "../DataGrid";
import { Form } from "../Form";
import { hasPermission, usePermissionContext, } from "../../framework";
import makeStyles from "@mui/styles/makeStyles";
import Loader from "../../standalone/Loader";
import { useRouteInfo } from "../../utils";
import { SentryRoutes } from "../../standalone/SentryRoute";
var CrudImport = React.lazy(function () { return import("./Import"); });
var useStyles = makeStyles({
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
var CrudDispatchContext = React.createContext(undefined);
export var useCrudDispatchContext = function () {
    var ctx = useContext(CrudDispatchContext);
    if (!ctx)
        throw new Error("CrudDispatchContext not set");
    return ctx;
};
export var CrudSpecialIds = ["import", "devimport", "new"];
var FormPageWrapper = function (props) {
    var _a;
    var params = useParams();
    if (!props.children)
        return React.createElement(React.Fragment, null);
    return props.form((_a = params.id) !== null && _a !== void 0 ? _a : "", props.children);
};
var CRUD = function (props) {
    var _a, _b, _c, _d;
    var navigate = useNavigate();
    var routeUrl = useRouteInfo(props.disableRouting).url;
    var location = useLocation();
    var perms = usePermissionContext()[0];
    var disableRouting = props.disableRouting, disableBackgroundGrid = props.disableBackgroundGrid, ForbiddenPage = props.forbiddenPage, requestEnableUserImport = props.enableUserImport, importConfig = props.importConfig, importUpdateKey = props.importUpdateKey, importHowTo = props.importHowTo, importUpdateKeyAdditionalFilters = props.importUpdateKeyAdditionalFilters, importValidate = props.importValidate;
    var hasImportPermission = !importUpdateKey ||
        (hasPermission(perms, props.editPermission) &&
            hasPermission(perms, props.newPermission));
    var enableUserImport = requestEnableUserImport && hasImportPermission;
    var GridWrapper = (_a = props.gridWrapper) !== null && _a !== void 0 ? _a : React.Fragment;
    var RouteComponent = (_b = props.routeComponent) !== null && _b !== void 0 ? _b : Route;
    var ImportUI = (_c = props.importUI) !== null && _c !== void 0 ? _c : CrudImport;
    var _e = useState((_d = props.initialView) !== null && _d !== void 0 ? _d : null), id = _e[0], setId = _e[1];
    var _f = useState(new Date().getTime().toString()), gridRefreshToken = _f[0], setGridRefreshToken = _f[1];
    var classes = useStyles();
    var showEditPage = useCallback(function (id) {
        if (disableRouting) {
            setId(id);
        }
        else {
            navigate("".concat(routeUrl, "/").concat(id));
        }
    }, [navigate, routeUrl, disableRouting]);
    var showNewPage = useCallback(function () {
        if (disableRouting) {
            setId("new");
        }
        else {
            navigate("".concat(routeUrl, "/new"));
        }
    }, [navigate, routeUrl, disableRouting]);
    var refreshGrid = useCallback(function () {
        setGridRefreshToken(new Date().getTime().toString());
    }, []);
    var showOverview = useCallback(function (forceRefresh) {
        if (disableRouting) {
            setId(null);
        }
        else {
            navigate(routeUrl);
        }
        if (forceRefresh)
            refreshGrid();
    }, [disableRouting, refreshGrid, navigate, routeUrl]);
    var openView = useCallback(function (id) {
        if (disableRouting) {
            setId(id);
        }
        else {
            navigate(routeUrl + "/" + id);
        }
    }, [disableRouting, navigate, routeUrl]);
    var handleSubmit = useCallback(function (data, submit, old) { return __awaiter(void 0, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = data.id;
                    if (disableRouting) {
                        setId(function (oldId) { return (oldId === null ? null : id); });
                    }
                    else if (location.pathname.startsWith(routeUrl + "/new") ||
                        location.pathname.startsWith(routeUrl + "/new/")) {
                        navigate("".concat(routeUrl, "/").concat(id), { replace: true });
                    }
                    refreshGrid();
                    if (!props.formProps.onSubmit) return [3 /*break*/, 2];
                    return [4 /*yield*/, props.formProps.onSubmit(data, submit, old)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, [
        props.formProps,
        disableRouting,
        location.pathname,
        navigate,
        routeUrl,
        refreshGrid,
    ]);
    var handleImportButton = useCallback(function () {
        if (disableRouting) {
            setId("import");
        }
        else {
            navigate("".concat(routeUrl, "/import"));
        }
    }, [disableRouting, navigate, routeUrl]);
    var grid = function (globalScrollListener) {
        var _a;
        return (React.createElement(Suspense, { fallback: React.createElement(Loader, null) },
            React.createElement(GridWrapper, null,
                React.createElement(BackendDataGrid, __assign({ enableDelete: hasPermission(perms, props.deletePermission), disableDeleteHint: props.deletePermissionHint, disableExport: !hasPermission(perms, props.exportPermission) }, props.gridProps, { model: props.model, forceRefreshToken: gridRefreshToken, onEdit: (hasPermission(perms, props.readPermission) ||
                        hasPermission(perms, props.editPermission)) &&
                        props.children
                        ? showEditPage
                        : undefined, onAddNew: hasPermission(perms, props.newPermission) && props.children
                        ? (_a = props.gridProps.onAddNew) !== null && _a !== void 0 ? _a : showNewPage
                        : props.newPermissionHint, onImport: enableUserImport ? handleImportButton : undefined, globalScrollListener: globalScrollListener })))));
    };
    var importer = function (guided) { return (React.createElement(ImportUI, { model: props.model, importConfig: importConfig, updateKey: importUpdateKey, updateKeyAdditionalFilters: importUpdateKeyAdditionalFilters, howTo: importHowTo, validate: importValidate, guided: guided })); };
    var lastFormId = useRef(null);
    var formKey = useRef(Date.now().toString(16));
    var form = function (id, formComponent) {
        var _a;
        // when we switch IDs (everything except from new -> id) we reset form fully
        if (lastFormId.current == null)
            lastFormId.current = id;
        if (lastFormId.current !== id) {
            if (lastFormId.current !== "new") {
                formKey.current = Date.now().toString(16);
            }
            lastFormId.current = id;
        }
        return (React.createElement(Form, __assign({ id: id === "new" ? null : id, key: formKey.current, model: props.model }, props.formProps, { readOnly: !hasPermission(perms, id === "new" ? props.newPermission : props.editPermission) || props.formProps.readOnly, readOnlyReason: props.editPermissionHint, onSubmit: handleSubmit, disableRouting: disableRouting, customProps: (_a = props.formProps.customProps) !== null && _a !== void 0 ? _a : {
                goBack: showOverview,
                open: openView,
                hasCustomSubmitHandler: props.formProps.onSubmit != null,
            } }), formComponent));
    };
    var dispatch = useMemo(function () { return ({
        refreshGrid: refreshGrid,
    }); }, [refreshGrid]);
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
            React.createElement(RouteComponent, { path: "import/*", element: hasImportPermission || !ForbiddenPage ? (importer(true)) : (React.createElement(ForbiddenPage, null)) }),
            React.createElement(RouteComponent, { path: "devimport/*", element: hasImportPermission || !ForbiddenPage ? (importer(false)) : (React.createElement(ForbiddenPage, null)) }),
            React.createElement(RouteComponent, { path: ":id/*", element: hasPermission(perms, props.readPermission) ||
                    hasPermission(perms, props.editPermission) ||
                    hasPermission(perms, props.newPermission) ||
                    !ForbiddenPage ? (React.createElement(FormPageWrapper, { form: form }, props.children)) : (React.createElement(ForbiddenPage, null)) })))))));
};
export default React.memo(CRUD);
