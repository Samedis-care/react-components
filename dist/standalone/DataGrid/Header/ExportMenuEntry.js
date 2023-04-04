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
import React, { useCallback, useContext, useState } from "react";
import { CircularProgress, ListItemIcon, ListItemText, MenuItem, } from "@material-ui/core";
import { Description as ExportIcon, Done as DoneIcon, Error as ErrorIcon, } from "@material-ui/icons";
import { dataGridPrepareFiltersAndSorts } from "../CallbackUtil";
import { getActiveDataGridColumns, useDataGridColumnState, useDataGridProps, useDataGridState, } from "../DataGrid";
import { DialogContext } from "../../../framework";
export var DataGridExportStatus;
(function (DataGridExportStatus) {
    DataGridExportStatus[DataGridExportStatus["Idle"] = 0] = "Idle";
    DataGridExportStatus[DataGridExportStatus["Working"] = 1] = "Working";
    DataGridExportStatus[DataGridExportStatus["Ready"] = 2] = "Ready";
    DataGridExportStatus[DataGridExportStatus["Error"] = 3] = "Error";
})(DataGridExportStatus || (DataGridExportStatus = {}));
// eslint-disable-next-line react/display-name
var ExportMenuEntry = React.forwardRef(function (props, ref) {
    var _a;
    var _b = useDataGridProps(), getAdditionalFilters = _b.getAdditionalFilters, columns = _b.columns, onError = _b.onError;
    var columnsState = useDataGridColumnState()[0];
    var state = useDataGridState()[0];
    var pushDialog = ((_a = useContext(DialogContext)) !== null && _a !== void 0 ? _a : [])[0];
    var _c = useState(DataGridExportStatus.Idle), status = _c[0], setStatus = _c[1];
    var _d = useState(undefined), exportData = _d[0], setExportData = _d[1];
    var IdleIcon = props.exporter.icon || ExportIcon;
    var _e = props.exporter, onRequest = _e.onRequest, onDownload = _e.onDownload, autoDownload = _e.autoDownload;
    var search = state.search, customData = state.customData, lockedColumns = state.lockedColumns, hiddenColumns = state.hiddenColumns;
    var finishExport = useCallback(function () {
        onDownload(exportData, pushDialog);
        setStatus(DataGridExportStatus.Idle);
    }, [onDownload, setStatus, exportData, pushDialog]);
    var startExport = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, sorts, fieldFilter, data, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setStatus(DataGridExportStatus.Working);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = dataGridPrepareFiltersAndSorts(columnsState), sorts = _a[0], fieldFilter = _a[1];
                    return [4 /*yield*/, onRequest(search, getAdditionalFilters ? getAdditionalFilters(customData) : {}, fieldFilter, sorts, getActiveDataGridColumns(columns, hiddenColumns, lockedColumns))];
                case 2:
                    data = _b.sent();
                    setExportData(data);
                    setStatus(DataGridExportStatus.Ready);
                    if (autoDownload)
                        finishExport();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    // eslint-disable-next-line no-console
                    console.error("[Components-Care] DataGrid Export failed", e_1);
                    if (onError)
                        onError(e_1);
                    setExportData(e_1);
                    setStatus(DataGridExportStatus.Error);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [
        columnsState,
        onRequest,
        search,
        getAdditionalFilters,
        customData,
        columns,
        hiddenColumns,
        lockedColumns,
        onError,
        autoDownload,
        finishExport,
    ]);
    var cancelExport = useCallback(function () {
        setStatus(DataGridExportStatus.Idle);
    }, [setStatus]);
    return (React.createElement(React.Fragment, null,
        status === DataGridExportStatus.Idle && (React.createElement(MenuItem, { onClick: startExport, innerRef: ref },
            React.createElement(ListItemIcon, null,
                React.createElement(IdleIcon, null)),
            React.createElement(ListItemText, { primary: props.exporter.getLabel() }))),
        status === DataGridExportStatus.Working && (React.createElement(MenuItem, { innerRef: ref },
            React.createElement(ListItemIcon, null,
                React.createElement(CircularProgress, { size: 24 })),
            React.createElement(ListItemText, { primary: props.exporter.getWorkingLabel() }))),
        status === DataGridExportStatus.Ready && (React.createElement(MenuItem, { onClick: finishExport, innerRef: ref },
            React.createElement(ListItemIcon, null,
                React.createElement(DoneIcon, null)),
            React.createElement(ListItemText, { primary: props.exporter.getReadyLabel() }))),
        status === DataGridExportStatus.Error && (React.createElement(MenuItem, { onClick: cancelExport, innerRef: ref },
            React.createElement(ListItemIcon, null,
                React.createElement(ErrorIcon, null)),
            React.createElement(ListItemText, { primary: props.exporter.getErrorLabel() })))));
});
export default React.memo(ExportMenuEntry);
