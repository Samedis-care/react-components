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
import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { Grid, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Header from "./Header";
import Footer from "./Footer";
import Settings from "./Settings";
import Content from "./Content";
import { debounce, isObjectEmpty, measureText, makeThemeStyles, useMultipleStyles, shallowCompareArray, } from "../../utils";
import { dataGridPrepareFiltersAndSorts } from "./CallbackUtil";
import { HEADER_PADDING } from "./Content/ColumnHeader";
import CustomFilterDialog from "./CustomFilterDialog";
import StatePersistence, { DataGridPersistentStateContext, } from "./StatePersistence";
import { suspend } from "suspend-react";
import { CustomFilterActiveContext } from "./Header/FilterBar";
var DataGridStateContext = React.createContext(undefined);
export var useDataGridState = function () {
    var ctx = useContext(DataGridStateContext);
    if (!ctx)
        throw new Error("State context not set");
    return ctx;
};
var DataGridPropsContext = React.createContext(undefined);
export var useDataGridProps = function () {
    var ctx = useContext(DataGridPropsContext);
    if (!ctx)
        throw new Error("Props context not set");
    return ctx;
};
var DataGridColumnsStateContext = React.createContext(undefined);
export var useDataGridColumnState = function () {
    var ctx = useContext(DataGridColumnsStateContext);
    if (!ctx)
        throw new Error("Columns state context not set");
    return ctx;
};
var DataGridColumnsWidthStateContext = React.createContext(undefined);
export var useDataGridColumnsWidthState = function () {
    var ctx = useContext(DataGridColumnsWidthStateContext);
    if (!ctx)
        throw new Error("Columns state width context not set");
    return ctx;
};
var DataGridRootRefContext = React.createContext(undefined);
export var useDataGridRootRef = function () {
    var ctx = useContext(DataGridRootRefContext);
    if (!ctx)
        throw new Error("RootRef context not set");
    return ctx;
};
export var getDataGridDefaultState = function (columns, defaultCustomData) { return ({
    search: "",
    rowsTotal: 0,
    rowsFiltered: null,
    showSettings: false,
    showFilterDialog: false,
    pages: [0, 0],
    hiddenColumns: columns.filter(function (col) { return col.hidden; }).map(function (col) { return col.field; }),
    lockedColumns: columns
        .filter(function (col) { return col.pinned || col.forcePin; })
        .map(function (col) { return col.field; }),
    selectAll: false,
    selectedRows: [],
    selectionUpdatedByProps: false,
    rows: {},
    dataLoadError: null,
    refreshData: 1,
    refreshShouldWipeRows: false,
    customData: defaultCustomData !== null && defaultCustomData !== void 0 ? defaultCustomData : {},
    initialResize: false,
}); };
export var getDataGridDefaultColumnsState = function (columns, defaultSort, defaultFilter) {
    var data = {};
    columns.forEach(function (column) {
        var defaultSortIndex = defaultSort === null || defaultSort === void 0 ? void 0 : defaultSort.findIndex(function (entry) { return entry.field === column.field; });
        var defaultFilterSetting = defaultFilter === null || defaultFilter === void 0 ? void 0 : defaultFilter.find(function (entry) { return entry.field === column.field; });
        data[column.field] = {
            sort: defaultSort && defaultSortIndex !== -1 && defaultSortIndex != null
                ? defaultSort[defaultSortIndex].direction
                : 0,
            sortOrder: defaultSortIndex != null && defaultSortIndex >= 0
                ? defaultSortIndex + 1
                : undefined,
            filter: defaultFilterSetting === null || defaultFilterSetting === void 0 ? void 0 : defaultFilterSetting.filter,
        };
    });
    return data;
};
var useStyles = makeStyles(function (theme) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103, _104, _105, _106, _107, _108, _109, _110, _111, _112, _113, _114, _115, _116, _117, _118, _119, _120, _121, _122, _123, _124, _125, _126, _127, _128, _129, _130, _131, _132, _133, _134, _135, _136, _137, _138, _139, _140, _141, _142, _143, _144, _145, _146, _147, _148, _149, _150, _151, _152, _153, _154, _155, _156, _157, _158, _159, _160, _161, _162, _163, _164, _165, _166, _167, _168, _169, _170, _171, _172, _173, _174, _175, _176, _177, _178, _179, _180, _181, _182, _183, _184, _185, _186, _187, _188, _189, _190, _191, _192, _193, _194, _195, _196, _197, _198, _199, _200, _201, _202, _203, _204, _205, _206, _207, _208, _209, _210, _211, _212, _213, _214, _215, _216, _217, _218, _219, _220, _221, _222, _223, _224, _225, _226, _227, _228, _229, _230, _231, _232, _233, _234, _235, _236, _237, _238, _239, _240, _241, _242, _243, _244, _245, _246, _247, _248, _249, _250, _251, _252, _253, _254, _255, _256, _257, _258, _259, _260, _261, _262, _263, _264, _265, _266, _267, _268, _269, _270, _271, _272, _273, _274, _275, _276, _277, _278, _279, _280, _281, _282, _283, _284, _285, _286, _287, _288, _289, _290, _291, _292, _293, _294, _295, _296, _297, _298, _299, _300, _301, _302, _303, _304, _305, _306, _307, _308, _309, _310, _311, _312, _313, _314, _315, _316, _317, _318, _319, _320, _321, _322, _323, _324, _325, _326;
    return ({
        wrapper: __assign({ width: ((_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.dataGrid) === null || _b === void 0 ? void 0 : _b.width) || "100%", height: ((_d = (_c = theme.componentsCare) === null || _c === void 0 ? void 0 : _c.dataGrid) === null || _d === void 0 ? void 0 : _d.height) || "100%", flexGrow: 1, borderRadius: ((_f = (_e = theme.componentsCare) === null || _e === void 0 ? void 0 : _e.dataGrid) === null || _f === void 0 ? void 0 : _f.borderRadius) ||
                theme.shape.borderRadius, border: ((_h = (_g = theme.componentsCare) === null || _g === void 0 ? void 0 : _g.dataGrid) === null || _h === void 0 ? void 0 : _h.border) ||
                "1px solid ".concat(theme.palette.divider), backgroundColor: ((_k = (_j = theme.componentsCare) === null || _j === void 0 ? void 0 : _j.dataGrid) === null || _k === void 0 ? void 0 : _k.backgroundColor) ||
                theme.palette.background.paper, background: (_m = (_l = theme.componentsCare) === null || _l === void 0 ? void 0 : _l.dataGrid) === null || _m === void 0 ? void 0 : _m.background }, (_p = (_o = theme.componentsCare) === null || _o === void 0 ? void 0 : _o.dataGrid) === null || _p === void 0 ? void 0 : _p.style),
        header: __assign({ border: ((_s = (_r = (_q = theme.componentsCare) === null || _q === void 0 ? void 0 : _q.dataGrid) === null || _r === void 0 ? void 0 : _r.header) === null || _s === void 0 ? void 0 : _s.border) ||
                "1px solid ".concat(theme.palette.divider), borderWidth: ((_v = (_u = (_t = theme.componentsCare) === null || _t === void 0 ? void 0 : _t.dataGrid) === null || _u === void 0 ? void 0 : _u.header) === null || _v === void 0 ? void 0 : _v.borderWidth) || "0 0 1px 0", padding: (_y = (_x = (_w = theme.componentsCare) === null || _w === void 0 ? void 0 : _w.dataGrid) === null || _x === void 0 ? void 0 : _x.header) === null || _y === void 0 ? void 0 : _y.padding, background: (_1 = (_0 = (_z = theme.componentsCare) === null || _z === void 0 ? void 0 : _z.dataGrid) === null || _0 === void 0 ? void 0 : _0.header) === null || _1 === void 0 ? void 0 : _1.background, backgroundColor: (_4 = (_3 = (_2 = theme.componentsCare) === null || _2 === void 0 ? void 0 : _2.dataGrid) === null || _3 === void 0 ? void 0 : _3.header) === null || _4 === void 0 ? void 0 : _4.backgroundColor }, (_7 = (_6 = (_5 = theme.componentsCare) === null || _5 === void 0 ? void 0 : _5.dataGrid) === null || _6 === void 0 ? void 0 : _6.header) === null || _7 === void 0 ? void 0 : _7.style),
        content: __assign({ position: "relative", margin: (_10 = (_9 = (_8 = theme.componentsCare) === null || _8 === void 0 ? void 0 : _8.dataGrid) === null || _9 === void 0 ? void 0 : _9.content) === null || _10 === void 0 ? void 0 : _10.margin, padding: (_13 = (_12 = (_11 = theme.componentsCare) === null || _11 === void 0 ? void 0 : _11.dataGrid) === null || _12 === void 0 ? void 0 : _12.content) === null || _13 === void 0 ? void 0 : _13.padding, border: (_16 = (_15 = (_14 = theme.componentsCare) === null || _14 === void 0 ? void 0 : _14.dataGrid) === null || _15 === void 0 ? void 0 : _15.content) === null || _16 === void 0 ? void 0 : _16.border, borderWidth: (_19 = (_18 = (_17 = theme.componentsCare) === null || _17 === void 0 ? void 0 : _17.dataGrid) === null || _18 === void 0 ? void 0 : _18.content) === null || _19 === void 0 ? void 0 : _19.borderWidth, background: (_22 = (_21 = (_20 = theme.componentsCare) === null || _20 === void 0 ? void 0 : _20.dataGrid) === null || _21 === void 0 ? void 0 : _21.content) === null || _22 === void 0 ? void 0 : _22.background, backgroundColor: (_25 = (_24 = (_23 = theme.componentsCare) === null || _23 === void 0 ? void 0 : _23.dataGrid) === null || _24 === void 0 ? void 0 : _24.content) === null || _25 === void 0 ? void 0 : _25.backgroundColor }, (_28 = (_27 = (_26 = theme.componentsCare) === null || _26 === void 0 ? void 0 : _26.dataGrid) === null || _27 === void 0 ? void 0 : _27.content) === null || _28 === void 0 ? void 0 : _28.style),
        footer: __assign({ border: ((_31 = (_30 = (_29 = theme.componentsCare) === null || _29 === void 0 ? void 0 : _29.dataGrid) === null || _30 === void 0 ? void 0 : _30.footer) === null || _31 === void 0 ? void 0 : _31.border) ||
                "1px solid ".concat(theme.palette.divider), borderWidth: ((_34 = (_33 = (_32 = theme.componentsCare) === null || _32 === void 0 ? void 0 : _32.dataGrid) === null || _33 === void 0 ? void 0 : _33.footer) === null || _34 === void 0 ? void 0 : _34.borderWidth) || "1px 0 0 0", padding: (_37 = (_36 = (_35 = theme.componentsCare) === null || _35 === void 0 ? void 0 : _35.dataGrid) === null || _36 === void 0 ? void 0 : _36.footer) === null || _37 === void 0 ? void 0 : _37.padding, background: (_40 = (_39 = (_38 = theme.componentsCare) === null || _38 === void 0 ? void 0 : _38.dataGrid) === null || _39 === void 0 ? void 0 : _39.footer) === null || _40 === void 0 ? void 0 : _40.background, backgroundColor: (_43 = (_42 = (_41 = theme.componentsCare) === null || _41 === void 0 ? void 0 : _41.dataGrid) === null || _42 === void 0 ? void 0 : _42.footer) === null || _43 === void 0 ? void 0 : _43.backgroundColor }, (_46 = (_45 = (_44 = theme.componentsCare) === null || _44 === void 0 ? void 0 : _44.dataGrid) === null || _45 === void 0 ? void 0 : _45.footer) === null || _46 === void 0 ? void 0 : _46.style),
        rowOdd: __assign({ background: (_50 = (_49 = (_48 = (_47 = theme.componentsCare) === null || _47 === void 0 ? void 0 : _47.dataGrid) === null || _48 === void 0 ? void 0 : _48.content) === null || _49 === void 0 ? void 0 : _49.row) === null || _50 === void 0 ? void 0 : _50.background, backgroundColor: (_54 = (_53 = (_52 = (_51 = theme.componentsCare) === null || _51 === void 0 ? void 0 : _51.dataGrid) === null || _52 === void 0 ? void 0 : _52.content) === null || _53 === void 0 ? void 0 : _53.row) === null || _54 === void 0 ? void 0 : _54.backgroundColor, padding: (_58 = (_57 = (_56 = (_55 = theme.componentsCare) === null || _55 === void 0 ? void 0 : _55.dataGrid) === null || _56 === void 0 ? void 0 : _56.content) === null || _57 === void 0 ? void 0 : _57.row) === null || _58 === void 0 ? void 0 : _58.padding }, (_62 = (_61 = (_60 = (_59 = theme.componentsCare) === null || _59 === void 0 ? void 0 : _59.dataGrid) === null || _60 === void 0 ? void 0 : _60.content) === null || _61 === void 0 ? void 0 : _61.row) === null || _62 === void 0 ? void 0 : _62.odd),
        rowEven: __assign({ background: (_66 = (_65 = (_64 = (_63 = theme.componentsCare) === null || _63 === void 0 ? void 0 : _63.dataGrid) === null || _64 === void 0 ? void 0 : _64.content) === null || _65 === void 0 ? void 0 : _65.row) === null || _66 === void 0 ? void 0 : _66.background, backgroundColor: (_70 = (_69 = (_68 = (_67 = theme.componentsCare) === null || _67 === void 0 ? void 0 : _67.dataGrid) === null || _68 === void 0 ? void 0 : _68.content) === null || _69 === void 0 ? void 0 : _69.row) === null || _70 === void 0 ? void 0 : _70.backgroundColor, padding: (_74 = (_73 = (_72 = (_71 = theme.componentsCare) === null || _71 === void 0 ? void 0 : _71.dataGrid) === null || _72 === void 0 ? void 0 : _72.content) === null || _73 === void 0 ? void 0 : _73.row) === null || _74 === void 0 ? void 0 : _74.padding }, (_78 = (_77 = (_76 = (_75 = theme.componentsCare) === null || _75 === void 0 ? void 0 : _75.dataGrid) === null || _76 === void 0 ? void 0 : _76.content) === null || _77 === void 0 ? void 0 : _77.row) === null || _78 === void 0 ? void 0 : _78.even),
        cell: __assign({ border: ((_84 = (_83 = (_82 = (_81 = (_80 = (_79 = theme.componentsCare) === null || _79 === void 0 ? void 0 : _79.dataGrid) === null || _80 === void 0 ? void 0 : _80.content) === null || _81 === void 0 ? void 0 : _81.row) === null || _82 === void 0 ? void 0 : _82.cell) === null || _83 === void 0 ? void 0 : _83.data) === null || _84 === void 0 ? void 0 : _84.border) ||
                ((_89 = (_88 = (_87 = (_86 = (_85 = theme.componentsCare) === null || _85 === void 0 ? void 0 : _85.dataGrid) === null || _86 === void 0 ? void 0 : _86.content) === null || _87 === void 0 ? void 0 : _87.row) === null || _88 === void 0 ? void 0 : _88.cell) === null || _89 === void 0 ? void 0 : _89.border) ||
                "1px solid ".concat((_96 = (_95 = (_94 = (_93 = (_92 = (_91 = (_90 = theme.componentsCare) === null || _90 === void 0 ? void 0 : _90.dataGrid) === null || _91 === void 0 ? void 0 : _91.content) === null || _92 === void 0 ? void 0 : _92.row) === null || _93 === void 0 ? void 0 : _93.cell) === null || _94 === void 0 ? void 0 : _94.data) === null || _95 === void 0 ? void 0 : _95.borderColor) !== null && _96 !== void 0 ? _96 : theme.palette.divider), borderWidth: ((_102 = (_101 = (_100 = (_99 = (_98 = (_97 = theme.componentsCare) === null || _97 === void 0 ? void 0 : _97.dataGrid) === null || _98 === void 0 ? void 0 : _98.content) === null || _99 === void 0 ? void 0 : _99.row) === null || _100 === void 0 ? void 0 : _100.cell) === null || _101 === void 0 ? void 0 : _101.data) === null || _102 === void 0 ? void 0 : _102.borderWidth) ||
                ((_107 = (_106 = (_105 = (_104 = (_103 = theme.componentsCare) === null || _103 === void 0 ? void 0 : _103.dataGrid) === null || _104 === void 0 ? void 0 : _104.content) === null || _105 === void 0 ? void 0 : _105.row) === null || _106 === void 0 ? void 0 : _106.cell) === null || _107 === void 0 ? void 0 : _107.borderWidth) ||
                "0 1px 1px 0", padding: ((_113 = (_112 = (_111 = (_110 = (_109 = (_108 = theme.componentsCare) === null || _108 === void 0 ? void 0 : _108.dataGrid) === null || _109 === void 0 ? void 0 : _109.content) === null || _110 === void 0 ? void 0 : _110.row) === null || _111 === void 0 ? void 0 : _111.cell) === null || _112 === void 0 ? void 0 : _112.data) === null || _113 === void 0 ? void 0 : _113.padding) ||
                ((_118 = (_117 = (_116 = (_115 = (_114 = theme.componentsCare) === null || _114 === void 0 ? void 0 : _114.dataGrid) === null || _115 === void 0 ? void 0 : _115.content) === null || _116 === void 0 ? void 0 : _116.row) === null || _117 === void 0 ? void 0 : _117.cell) === null || _118 === void 0 ? void 0 : _118.padding) ||
                "0 ".concat(HEADER_PADDING / 2, "px") }, (_124 = (_123 = (_122 = (_121 = (_120 = (_119 = theme.componentsCare) === null || _119 === void 0 ? void 0 : _119.dataGrid) === null || _120 === void 0 ? void 0 : _120.content) === null || _121 === void 0 ? void 0 : _121.row) === null || _122 === void 0 ? void 0 : _122.cell) === null || _123 === void 0 ? void 0 : _123.data) === null || _124 === void 0 ? void 0 : _124.style),
        headerCell: __assign({ border: ((_129 = (_128 = (_127 = (_126 = (_125 = theme.componentsCare) === null || _125 === void 0 ? void 0 : _125.dataGrid) === null || _126 === void 0 ? void 0 : _126.content) === null || _127 === void 0 ? void 0 : _127.row) === null || _128 === void 0 ? void 0 : _128.cell) === null || _129 === void 0 ? void 0 : _129.border) ||
                ((_135 = (_134 = (_133 = (_132 = (_131 = (_130 = theme.componentsCare) === null || _130 === void 0 ? void 0 : _130.dataGrid) === null || _131 === void 0 ? void 0 : _131.content) === null || _132 === void 0 ? void 0 : _132.row) === null || _133 === void 0 ? void 0 : _133.cell) === null || _134 === void 0 ? void 0 : _134.header) === null || _135 === void 0 ? void 0 : _135.border), borderWidth: ((_140 = (_139 = (_138 = (_137 = (_136 = theme.componentsCare) === null || _136 === void 0 ? void 0 : _136.dataGrid) === null || _137 === void 0 ? void 0 : _137.content) === null || _138 === void 0 ? void 0 : _138.row) === null || _139 === void 0 ? void 0 : _139.cell) === null || _140 === void 0 ? void 0 : _140.borderWidth) ||
                ((_146 = (_145 = (_144 = (_143 = (_142 = (_141 = theme.componentsCare) === null || _141 === void 0 ? void 0 : _141.dataGrid) === null || _142 === void 0 ? void 0 : _142.content) === null || _143 === void 0 ? void 0 : _143.row) === null || _144 === void 0 ? void 0 : _144.cell) === null || _145 === void 0 ? void 0 : _145.header) === null || _146 === void 0 ? void 0 : _146.borderWidth) ||
                "0 1px 1px 0", padding: ((_152 = (_151 = (_150 = (_149 = (_148 = (_147 = theme.componentsCare) === null || _147 === void 0 ? void 0 : _147.dataGrid) === null || _148 === void 0 ? void 0 : _148.content) === null || _149 === void 0 ? void 0 : _149.row) === null || _150 === void 0 ? void 0 : _150.cell) === null || _151 === void 0 ? void 0 : _151.header) === null || _152 === void 0 ? void 0 : _152.padding) ||
                ((_157 = (_156 = (_155 = (_154 = (_153 = theme.componentsCare) === null || _153 === void 0 ? void 0 : _153.dataGrid) === null || _154 === void 0 ? void 0 : _154.content) === null || _155 === void 0 ? void 0 : _155.row) === null || _156 === void 0 ? void 0 : _156.cell) === null || _157 === void 0 ? void 0 : _157.padding) ||
                "0 ".concat(HEADER_PADDING / 2, "px"), backgroundColor: ((_163 = (_162 = (_161 = (_160 = (_159 = (_158 = theme.componentsCare) === null || _158 === void 0 ? void 0 : _158.dataGrid) === null || _159 === void 0 ? void 0 : _159.content) === null || _160 === void 0 ? void 0 : _160.row) === null || _161 === void 0 ? void 0 : _161.cell) === null || _162 === void 0 ? void 0 : _162.header) === null || _163 === void 0 ? void 0 : _163.backgroundColor) || theme.palette.background.paper, color: theme.palette.getContrastText((_170 = (_169 = (_168 = (_167 = (_166 = (_165 = (_164 = theme.componentsCare) === null || _164 === void 0 ? void 0 : _164.dataGrid) === null || _165 === void 0 ? void 0 : _165.content) === null || _166 === void 0 ? void 0 : _166.row) === null || _167 === void 0 ? void 0 : _167.cell) === null || _168 === void 0 ? void 0 : _168.header) === null || _169 === void 0 ? void 0 : _169.backgroundColor) !== null && _170 !== void 0 ? _170 : theme.palette.background.paper) }, (_176 = (_175 = (_174 = (_173 = (_172 = (_171 = theme.componentsCare) === null || _171 === void 0 ? void 0 : _171.dataGrid) === null || _172 === void 0 ? void 0 : _172.content) === null || _173 === void 0 ? void 0 : _173.row) === null || _174 === void 0 ? void 0 : _174.cell) === null || _175 === void 0 ? void 0 : _175.header) === null || _176 === void 0 ? void 0 : _176.style),
        dataCell: __assign({ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", "& > *": {
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
            }, padding: HEADER_PADDING / 2, borderColor: ((_182 = (_181 = (_180 = (_179 = (_178 = (_177 = theme.componentsCare) === null || _177 === void 0 ? void 0 : _177.dataGrid) === null || _178 === void 0 ? void 0 : _178.content) === null || _179 === void 0 ? void 0 : _179.row) === null || _180 === void 0 ? void 0 : _180.cell) === null || _181 === void 0 ? void 0 : _181.data) === null || _182 === void 0 ? void 0 : _182.borderColor) ||
                ((_186 = (_185 = (_184 = (_183 = theme.componentsCare) === null || _183 === void 0 ? void 0 : _183.dataGrid) === null || _184 === void 0 ? void 0 : _184.content) === null || _185 === void 0 ? void 0 : _185.row) === null || _186 === void 0 ? void 0 : _186.borderColor), color: theme.palette.getContrastText((_190 = (_189 = (_188 = (_187 = theme.componentsCare) === null || _187 === void 0 ? void 0 : _187.dataGrid) === null || _188 === void 0 ? void 0 : _188.content) === null || _189 === void 0 ? void 0 : _189.backgroundColor) !== null && _190 !== void 0 ? _190 : theme.palette.background.paper) }, (_196 = (_195 = (_194 = (_193 = (_192 = (_191 = theme.componentsCare) === null || _191 === void 0 ? void 0 : _191.dataGrid) === null || _192 === void 0 ? void 0 : _192.content) === null || _193 === void 0 ? void 0 : _193.row) === null || _194 === void 0 ? void 0 : _194.cell) === null || _195 === void 0 ? void 0 : _195.data) === null || _196 === void 0 ? void 0 : _196.style),
        dataCellSelected: __assign({ backgroundColor: ((_201 = (_200 = (_199 = (_198 = (_197 = theme.componentsCare) === null || _197 === void 0 ? void 0 : _197.dataGrid) === null || _198 === void 0 ? void 0 : _198.content) === null || _199 === void 0 ? void 0 : _199.row) === null || _200 === void 0 ? void 0 : _200.selected) === null || _201 === void 0 ? void 0 : _201.backgroundColor) || theme.palette.action.hover, color: theme.palette.getContrastText(((_206 = (_205 = (_204 = (_203 = (_202 = theme.componentsCare) === null || _202 === void 0 ? void 0 : _202.dataGrid) === null || _203 === void 0 ? void 0 : _203.content) === null || _204 === void 0 ? void 0 : _204.row) === null || _205 === void 0 ? void 0 : _205.selected) === null || _206 === void 0 ? void 0 : _206.backgroundColor) ||
                ((_209 = (_208 = (_207 = theme.componentsCare) === null || _207 === void 0 ? void 0 : _207.dataGrid) === null || _208 === void 0 ? void 0 : _208.content) === null || _209 === void 0 ? void 0 : _209.backgroundColor) ||
                theme.palette.background.paper) }, (_214 = (_213 = (_212 = (_211 = (_210 = theme.componentsCare) === null || _210 === void 0 ? void 0 : _210.dataGrid) === null || _211 === void 0 ? void 0 : _211.content) === null || _212 === void 0 ? void 0 : _212.row) === null || _213 === void 0 ? void 0 : _213.selected) === null || _214 === void 0 ? void 0 : _214.style),
        columnHeaderContentWrapper: __assign({ width: "100%", minWidth: "100%", zIndex: 1000, fontSize: (_221 = (_220 = (_219 = (_218 = (_217 = (_216 = (_215 = theme.componentsCare) === null || _215 === void 0 ? void 0 : _215.dataGrid) === null || _216 === void 0 ? void 0 : _216.content) === null || _217 === void 0 ? void 0 : _217.row) === null || _218 === void 0 ? void 0 : _218.cell) === null || _219 === void 0 ? void 0 : _219.header) === null || _220 === void 0 ? void 0 : _220.label) === null || _221 === void 0 ? void 0 : _221.fontSize, fontWeight: (_228 = (_227 = (_226 = (_225 = (_224 = (_223 = (_222 = theme.componentsCare) === null || _222 === void 0 ? void 0 : _222.dataGrid) === null || _223 === void 0 ? void 0 : _223.content) === null || _224 === void 0 ? void 0 : _224.row) === null || _225 === void 0 ? void 0 : _225.cell) === null || _226 === void 0 ? void 0 : _226.header) === null || _227 === void 0 ? void 0 : _227.label) === null || _228 === void 0 ? void 0 : _228.fontWeight, fontStyle: (_235 = (_234 = (_233 = (_232 = (_231 = (_230 = (_229 = theme.componentsCare) === null || _229 === void 0 ? void 0 : _229.dataGrid) === null || _230 === void 0 ? void 0 : _230.content) === null || _231 === void 0 ? void 0 : _231.row) === null || _232 === void 0 ? void 0 : _232.cell) === null || _233 === void 0 ? void 0 : _233.header) === null || _234 === void 0 ? void 0 : _234.label) === null || _235 === void 0 ? void 0 : _235.fontStyle, border: ((_242 = (_241 = (_240 = (_239 = (_238 = (_237 = (_236 = theme.componentsCare) === null || _236 === void 0 ? void 0 : _236.dataGrid) === null || _237 === void 0 ? void 0 : _237.content) === null || _238 === void 0 ? void 0 : _238.row) === null || _239 === void 0 ? void 0 : _239.cell) === null || _240 === void 0 ? void 0 : _240.header) === null || _241 === void 0 ? void 0 : _241.label) === null || _242 === void 0 ? void 0 : _242.border) ||
                "1px solid ".concat((_248 = (_247 = (_246 = (_245 = (_244 = (_243 = theme.componentsCare) === null || _243 === void 0 ? void 0 : _243.dataGrid) === null || _244 === void 0 ? void 0 : _244.content) === null || _245 === void 0 ? void 0 : _245.row) === null || _246 === void 0 ? void 0 : _246.cell) === null || _247 === void 0 ? void 0 : _247.borderColor) !== null && _248 !== void 0 ? _248 : theme.palette.divider), borderWidth: ((_255 = (_254 = (_253 = (_252 = (_251 = (_250 = (_249 = theme.componentsCare) === null || _249 === void 0 ? void 0 : _249.dataGrid) === null || _250 === void 0 ? void 0 : _250.content) === null || _251 === void 0 ? void 0 : _251.row) === null || _252 === void 0 ? void 0 : _252.cell) === null || _253 === void 0 ? void 0 : _253.header) === null || _254 === void 0 ? void 0 : _254.label) === null || _255 === void 0 ? void 0 : _255.borderWidth) || "0 0 0 0", background: (_262 = (_261 = (_260 = (_259 = (_258 = (_257 = (_256 = theme.componentsCare) === null || _256 === void 0 ? void 0 : _256.dataGrid) === null || _257 === void 0 ? void 0 : _257.content) === null || _258 === void 0 ? void 0 : _258.row) === null || _259 === void 0 ? void 0 : _259.cell) === null || _260 === void 0 ? void 0 : _260.header) === null || _261 === void 0 ? void 0 : _261.label) === null || _262 === void 0 ? void 0 : _262.background, backgroundColor: (_269 = (_268 = (_267 = (_266 = (_265 = (_264 = (_263 = theme.componentsCare) === null || _263 === void 0 ? void 0 : _263.dataGrid) === null || _264 === void 0 ? void 0 : _264.content) === null || _265 === void 0 ? void 0 : _265.row) === null || _266 === void 0 ? void 0 : _266.cell) === null || _267 === void 0 ? void 0 : _267.header) === null || _268 === void 0 ? void 0 : _268.label) === null || _269 === void 0 ? void 0 : _269.backgroundColor, padding: (_276 = (_275 = (_274 = (_273 = (_272 = (_271 = (_270 = theme.componentsCare) === null || _270 === void 0 ? void 0 : _270.dataGrid) === null || _271 === void 0 ? void 0 : _271.content) === null || _272 === void 0 ? void 0 : _272.row) === null || _273 === void 0 ? void 0 : _273.cell) === null || _274 === void 0 ? void 0 : _274.header) === null || _275 === void 0 ? void 0 : _275.label) === null || _276 === void 0 ? void 0 : _276.padding }, (_283 = (_282 = (_281 = (_280 = (_279 = (_278 = (_277 = theme.componentsCare) === null || _277 === void 0 ? void 0 : _277.dataGrid) === null || _278 === void 0 ? void 0 : _278.content) === null || _279 === void 0 ? void 0 : _279.row) === null || _280 === void 0 ? void 0 : _280.cell) === null || _281 === void 0 ? void 0 : _281.header) === null || _282 === void 0 ? void 0 : _282.label) === null || _283 === void 0 ? void 0 : _283.style),
        columnHeaderFilterable: {
            color: theme.palette.primary.main,
        },
        columnHeaderFilterButton: {
            padding: 0,
            color: "inherit",
        },
        columnHeaderFilterButtonActive: {
            color: theme.palette.secondary.main,
        },
        columnHeaderResizer: __assign({ cursor: "col-resize", width: 8, height: "100%", right: 0, top: 0, position: "absolute", border: ((_290 = (_289 = (_288 = (_287 = (_286 = (_285 = (_284 = theme.componentsCare) === null || _284 === void 0 ? void 0 : _284.dataGrid) === null || _285 === void 0 ? void 0 : _285.content) === null || _286 === void 0 ? void 0 : _286.row) === null || _287 === void 0 ? void 0 : _287.cell) === null || _288 === void 0 ? void 0 : _288.header) === null || _289 === void 0 ? void 0 : _289.resizer) === null || _290 === void 0 ? void 0 : _290.border) ||
                "1px solid ".concat((_296 = (_295 = (_294 = (_293 = (_292 = (_291 = theme.componentsCare) === null || _291 === void 0 ? void 0 : _291.dataGrid) === null || _292 === void 0 ? void 0 : _292.content) === null || _293 === void 0 ? void 0 : _293.row) === null || _294 === void 0 ? void 0 : _294.cell) === null || _295 === void 0 ? void 0 : _295.borderColor) !== null && _296 !== void 0 ? _296 : theme.palette.divider), borderWidth: ((_303 = (_302 = (_301 = (_300 = (_299 = (_298 = (_297 = theme.componentsCare) === null || _297 === void 0 ? void 0 : _297.dataGrid) === null || _298 === void 0 ? void 0 : _298.content) === null || _299 === void 0 ? void 0 : _299.row) === null || _300 === void 0 ? void 0 : _300.cell) === null || _301 === void 0 ? void 0 : _301.header) === null || _302 === void 0 ? void 0 : _302.resizer) === null || _303 === void 0 ? void 0 : _303.borderWidth) || "0 0 0 0", background: (_310 = (_309 = (_308 = (_307 = (_306 = (_305 = (_304 = theme.componentsCare) === null || _304 === void 0 ? void 0 : _304.dataGrid) === null || _305 === void 0 ? void 0 : _305.content) === null || _306 === void 0 ? void 0 : _306.row) === null || _307 === void 0 ? void 0 : _307.cell) === null || _308 === void 0 ? void 0 : _308.header) === null || _309 === void 0 ? void 0 : _309.resizer) === null || _310 === void 0 ? void 0 : _310.background, backgroundColor: (_317 = (_316 = (_315 = (_314 = (_313 = (_312 = (_311 = theme.componentsCare) === null || _311 === void 0 ? void 0 : _311.dataGrid) === null || _312 === void 0 ? void 0 : _312.content) === null || _313 === void 0 ? void 0 : _313.row) === null || _314 === void 0 ? void 0 : _314.cell) === null || _315 === void 0 ? void 0 : _315.header) === null || _316 === void 0 ? void 0 : _316.resizer) === null || _317 === void 0 ? void 0 : _317.backgroundColor }, (_324 = (_323 = (_322 = (_321 = (_320 = (_319 = (_318 = theme.componentsCare) === null || _318 === void 0 ? void 0 : _318.dataGrid) === null || _319 === void 0 ? void 0 : _319.content) === null || _320 === void 0 ? void 0 : _320.row) === null || _321 === void 0 ? void 0 : _321.cell) === null || _322 === void 0 ? void 0 : _322.header) === null || _323 === void 0 ? void 0 : _323.resizer) === null || _324 === void 0 ? void 0 : _324.style),
        columnHeaderFilterPopup: {
            width: 160,
        },
        columnHeaderFilterIcon: {
            width: 16,
            height: "auto",
        },
        columnHeaderSortIcon: {
            height: 24,
        },
        quickFilterActiveIcon: {
            color: theme.palette.secondary.main,
        },
        customFilterIcon: {
            color: theme.palette.primary.main,
        },
        customFilterActiveIcon: {
            color: theme.palette.secondary.main,
        },
        customFilterBorder: {
            borderColor: theme.palette.secondary.main,
            "& > fieldset": {
                borderColor: theme.palette.secondary.main,
            },
        },
        columnHeaderLabel: {
            textOverflow: "ellipsis",
            overflow: "hidden",
            "&:hover": {
                pointerEvents: "auto",
            },
        },
        disableClick: {
            userSelect: "none",
        },
        filterClearBtn: {
            padding: 0,
        },
        filterBarBox: {
            height: "100%",
        },
        filterBarGrid: {
            height: "calc(100% + ".concat(theme.spacing(2), ")"),
            width: "100%",
        },
        setFilterContainer: {
            maxHeight: "40vh",
            overflow: "auto",
        },
        setFilterListItem: {
            paddingLeft: 0,
            paddingRight: 0,
        },
        setFilterListItemDivider: {
            padding: 0,
        },
        setFilterListDivider: {
            width: "100%",
        },
        contentOverlayCollapse: {
            position: "absolute",
            zIndex: 1000,
            width: "100%",
            maxHeight: "100%",
            overflow: "auto",
        },
        paginationText: {
            padding: "12px 0",
        },
        selectAllWrapper: {},
        selectAllCheckbox: {
            padding: "4px 0",
        },
        selectCheckbox: {
            padding: 0,
        },
        contentOverlayPaper: {
            padding: "0",
        },
        contentOverlayClosed: {
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: ((_326 = (_325 = theme.componentsCare) === null || _325 === void 0 ? void 0 : _325.dataGrid) === null || _326 === void 0 ? void 0 : _326.backgroundColor) ||
                theme.palette.background.paper,
        },
        customFilterContainer: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
        },
    });
}, { name: "CcDataGrid" });
var useThemeStyles = makeThemeStyles(function (theme) { var _a; return (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.dataGridExpert; }, "CcDataGrid");
export var useDataGridStyles = function () {
    return useDataGridStylesInternal(useDataGridProps());
};
var useDataGridStylesInternal = function (props) {
    return useMultipleStyles(props, useThemeStyles, useStyles);
};
export var getActiveDataGridColumns = function (columns, hiddenColumns, lockedColumns) {
    return columns
        .filter(function (column) { return !hiddenColumns.includes(column.field); })
        .filter(function (column) { return lockedColumns.includes(column.field); })
        .concat(columns
        .filter(function (column) { return !hiddenColumns.includes(column.field); })
        .filter(function (column) { return !lockedColumns.includes(column.field); }))
        .map(function (column) { return (__assign(__assign({}, column), { isLocked: lockedColumns.includes(column.field) })); });
};
export var getDefaultColumnWidths = function (columns, theme) {
    var widthData = {};
    columns.forEach(function (column) {
        try {
            widthData[column.field] =
                measureText(theme.typography.body1.font || "16px Roboto, sans-serif", column.headerName).width + 100;
        }
        catch (e) {
            // if canvas is not available to measure text
            widthData[column.field] = column.headerName.length * 16;
        }
        if (column.width) {
            // initial width
            if (column.width[2] !== undefined) {
                widthData[column.field] = column.width[2];
            }
            // min width
            widthData[column.field] = Math.max(column.width[0], widthData[column.field]);
            // max width
            widthData[column.field] = Math.min(column.width[1], widthData[column.field]);
        }
    });
    return widthData;
};
var DataGrid = function (props) {
    var columns = props.columns, loadData = props.loadData, getAdditionalFilters = props.getAdditionalFilters, forceRefreshToken = props.forceRefreshToken, defaultCustomData = props.defaultCustomData, overrideCustomData = props.overrideCustomData, onSelectionChange = props.onSelectionChange, defaultSort = props.defaultSort, defaultFilter = props.defaultFilter, disableFooter = props.disableFooter, disableSelection = props.disableSelection, headerHeight = props.headerHeight, selection = props.selection, overrideFilter = props.overrideFilter, globalScrollListener = props.globalScrollListener;
    var rowsPerPage = props.rowsPerPage || 25;
    var theme = useTheme();
    var persistedContext = useContext(DataGridPersistentStateContext);
    var persistedPromise = (persistedContext || [])[0];
    var persisted = suspend(function () { return Promise.resolve(persistedPromise); }, [
        persistedPromise,
    ]);
    var classes = useDataGridStylesInternal(props);
    var statePack = useState(function () {
        var _a, _b, _c;
        return (__assign(__assign(__assign({}, getDataGridDefaultState(columns, undefined)), persisted === null || persisted === void 0 ? void 0 : persisted.state), { customData: (_c = (_b = overrideCustomData !== null && overrideCustomData !== void 0 ? overrideCustomData : (_a = persisted === null || persisted === void 0 ? void 0 : persisted.state) === null || _a === void 0 ? void 0 : _a.customData) !== null && _b !== void 0 ? _b : defaultCustomData) !== null && _c !== void 0 ? _c : {} }));
    });
    var state = statePack[0], setState = statePack[1];
    var search = state.search, rows = state.rows, pages = state.pages, hiddenColumns = state.hiddenColumns, lockedColumns = state.lockedColumns, refreshData = state.refreshData, customData = state.customData, selectAll = state.selectAll, selectedRows = state.selectedRows, selectionUpdatedByProps = state.selectionUpdatedByProps;
    var lastRefreshData = useRef(0);
    var activeCustomFiltersPack = useState(0);
    var gridRoot = useRef();
    var visibleColumns = useMemo(function () { return getActiveDataGridColumns(columns, hiddenColumns, lockedColumns); }, [columns, hiddenColumns, lockedColumns]);
    var columnsStatePack = useState(function () {
        var ret = __assign(__assign({}, getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter)), persisted === null || persisted === void 0 ? void 0 : persisted.columnState);
        if (overrideFilter) {
            for (var field in ret) {
                ret[field].filter = undefined;
            }
            overrideFilter.forEach(function (override) {
                if (override.field in ret) {
                    ret[override.field].filter = override.filter;
                }
            });
        }
        return ret;
    });
    var columnsState = columnsStatePack[0];
    var columnWidthStatePack = useState(function () { return (__assign(__assign({}, getDefaultColumnWidths(columns, theme)), persisted === null || persisted === void 0 ? void 0 : persisted.columnWidth)); });
    // update selection (if controlled)
    useEffect(function () {
        if (!selection)
            return;
        setState(function (prev) {
            var stateEqual = prev.selectAll === selection[0] &&
                shallowCompareArray(prev.selectedRows, selection[1]);
            return stateEqual
                ? prev
                : __assign(__assign({}, prev), { selectAll: selection[0], selectedRows: selection[1], selectionUpdatedByProps: true });
        });
    }, [setState, selection]);
    // refresh data if desired
    useEffect(function () {
        // we have an issue with a rare stuck loading bug. my assumption is that
        // React batches state updates and refreshData turns from 0 to 2 instantly
        // this causes a permanent loading screen because 1 is skipped
        var skippedFirstRefresh = lastRefreshData.current === 0 && refreshData === 2;
        lastRefreshData.current = refreshData;
        if (refreshData !== 1 && !skippedFirstRefresh) {
            return;
        }
        var _a = dataGridPrepareFiltersAndSorts(columnsState), sorts = _a[0], fieldFilter = _a[1];
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _loop_1, pageIndex;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _loop_1 = function (pageIndex) {
                            var data_1, dataRowsTotal, hasPartialPage, newPage_1, rowsAsObject_1, i, err_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        // check if page was already loaded
                                        if (pageIndex * rowsPerPage in rows) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, loadData({
                                                page: pageIndex + 1,
                                                rows: rowsPerPage,
                                                quickFilter: search,
                                                additionalFilters: getAdditionalFilters
                                                    ? getAdditionalFilters(state.customData)
                                                    : state.customData,
                                                fieldFilter: fieldFilter,
                                                sort: sorts,
                                            })];
                                    case 2:
                                        data_1 = _c.sent();
                                        dataRowsTotal = (_a = data_1.rowsFiltered) !== null && _a !== void 0 ? _a : data_1.rowsTotal;
                                        // check if we are on an invalid page
                                        if (pageIndex !== 0 &&
                                            rowsPerPage !== 0 &&
                                            dataRowsTotal !== 0 &&
                                            data_1.rows.length === 0) {
                                            hasPartialPage = dataRowsTotal % rowsPerPage !== 0;
                                            newPage_1 = ((dataRowsTotal / rowsPerPage) | 0) + (hasPartialPage ? 0 : -1);
                                            // eslint-disable-next-line no-console
                                            console.assert(newPage_1 !== pageIndex, "[Components-Care] [DataGrid] Detected invalid page, but newly calculated page equals invalid page");
                                            if (newPage_1 !== pageIndex) {
                                                setState(function (prevState) { return (__assign(__assign({}, prevState), { pages: [newPage_1, newPage_1] })); });
                                            }
                                        }
                                        rowsAsObject_1 = {};
                                        for (i = 0; i < data_1.rows.length; i++) {
                                            rowsAsObject_1[pageIndex * rowsPerPage + i] = data_1.rows[i];
                                        }
                                        setState(function (prevState) {
                                            var _a;
                                            return (__assign(__assign({}, prevState), { rowsTotal: data_1.rowsTotal, rowsFiltered: (_a = data_1.rowsFiltered) !== null && _a !== void 0 ? _a : null, dataLoadError: null, rows: Object.assign({}, prevState.rows, rowsAsObject_1) }));
                                        });
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_1 = _c.sent();
                                        // eslint-disable-next-line no-console
                                        console.error("[Components-Care] [DataGrid] LoadData: ", err_1);
                                        setState(function (prevState) { return (__assign(__assign({}, prevState), { dataLoadError: err_1, rowsFiltered: null, rowsTotal: 0 })); });
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        pageIndex = pages[0];
                        _b.label = 1;
                    case 1:
                        if (!(pageIndex <= pages[1])) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(pageIndex)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        pageIndex++;
                        return [3 /*break*/, 1];
                    case 4:
                        setState(function (prevState) { return (__assign(__assign({}, prevState), { refreshData: prevState.refreshData - 1, 
                            // handle filter changes invalidating data
                            rows: prevState.refreshShouldWipeRows && prevState.refreshData === 2
                                ? {}
                                : prevState.rows, refreshShouldWipeRows: false })); });
                        return [2 /*return*/];
                }
            });
        }); })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshData]);
    // instant refresh on pagination change
    var refresh = useCallback(function () {
        return setState(function (prevState) { return (__assign(__assign({}, prevState), { refreshData: Math.min(prevState.refreshData + 1, 2) })); });
    }, [setState]);
    // delay refresh call till useEffect has been processed, so we don't deadlock when auto page correction in the refresh
    // data function is performed.
    useLayoutEffect(refresh, [refresh, pages]);
    // debounced refresh on filter and sort changes
    var resetView = useMemo(function () {
        return debounce(function () {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { rows: {}, refreshData: Math.min(prevState.refreshData + 1, 2), refreshShouldWipeRows: prevState.refreshData === 1 })); });
        }, 500);
    }, [setState]);
    var initialRender = useRef(true);
    useEffect(function () {
        // make sure we don't refresh data twice on initial render
        if (refreshData && isObjectEmpty(rows) && initialRender.current) {
            initialRender.current = false;
            return;
        }
        resetView();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetView, search, columnsState, customData, forceRefreshToken]);
    // selection change event
    useEffect(function () {
        // don't trigger selection update event when triggered by prop update
        if (selectionUpdatedByProps)
            return;
        if (onSelectionChange) {
            onSelectionChange(selectAll, selectedRows);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectAll, selectedRows]);
    return (React.createElement(Grid, { container: true, direction: "column", justifyContent: "space-between", alignItems: "stretch", wrap: "nowrap", className: classes.wrapper, ref: function (r) { return (gridRoot.current = r ? r : undefined); } },
        React.createElement(DataGridRootRefContext.Provider, { value: gridRoot.current },
            React.createElement(DataGridPropsContext.Provider, { value: props },
                React.createElement(DataGridStateContext.Provider, { value: statePack },
                    React.createElement(DataGridColumnsStateContext.Provider, { value: columnsStatePack },
                        React.createElement(DataGridColumnsWidthStateContext.Provider, { value: columnWidthStatePack },
                            React.createElement(CustomFilterActiveContext.Provider, { value: activeCustomFiltersPack },
                                React.createElement(StatePersistence, null),
                                React.createElement(Grid, { item: true, className: classes.header },
                                    React.createElement(Header, null)),
                                React.createElement(Grid, { item: true, xs: true, className: classes.content },
                                    React.createElement(Settings, { columns: columns }),
                                    React.createElement(CustomFilterDialog, null),
                                    React.createElement(Content, { columns: visibleColumns, rowsPerPage: rowsPerPage, disableSelection: disableSelection, headerHeight: headerHeight, globalScrollListener: globalScrollListener })),
                                !disableFooter && (React.createElement(Grid, { item: true, className: classes.footer },
                                    React.createElement(Footer, null)))))))))));
};
export default React.memo(DataGrid);
