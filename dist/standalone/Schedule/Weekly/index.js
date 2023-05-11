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
import React, { useCallback, useEffect, useState } from "react";
import WeekViewDay from "./WeekViewDay";
import moment from "moment";
import { Box, CircularProgress, IconButton, Menu } from "@mui/material";
import { Button, Typography, Grid } from "@mui/material";
import { ArrowForwardIos, ArrowBackIos, Settings as SettingsIcon, } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ToDateLocaleStringOptions } from "../../../constants";
import useCCTranslations from "../../../utils/useCCTranslations";
import makeStyles from "@mui/styles/makeStyles";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import ScheduleFilterRenderer from "../Common/ScheduleFilterRenderers";
var normalizeMoment = function (instance) {
    return instance.weekday(0).hour(0).minute(0).second(0).millisecond(0);
};
var nowNormalized = function () { return normalizeMoment(moment()); };
var useStyles = makeStyles({
    todayBtn: {
        height: "100%",
    },
    week: {
        cursor: "pointer",
    },
    picker: {
        opacity: 0,
        position: "absolute",
        pointerEvents: "none",
        marginTop: -64,
    },
    filterWrapper: {
        top: "50%",
        position: "relative",
        transform: "translateY(-50%)",
    },
    filterSelect: {
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
    },
}, { name: "CcWeekView" });
var EMPTY_FILTERS = {};
var WeekView = function (props) {
    var _a;
    var loadData = props.loadData;
    var filters = (_a = props.filters) !== null && _a !== void 0 ? _a : EMPTY_FILTERS;
    var filterCount = Object.keys(filters).length;
    var classes = useStyles();
    var _b = useCCTranslations(), t = _b.t, i18n = _b.i18n;
    /**
     * The offset to the current week
     * Example: -1 for last week, 0 for this week, 1 for next week
     */
    var _c = useState(0), weekOffset = _c[0], setWeekOffset = _c[1];
    /**
     * The day contents data for this week
     * Format: IDayData[weekday starting Monday][n]
     */
    var _d = useState(null), data = _d[0], setData = _d[1];
    /**
     * The data load error that occurred (if any)
     */
    var _e = useState(null), loadError = _e[0], setLoadError = _e[1];
    /**
     * If the date picker is open
     */
    var _f = useState(null), datePickerAnchorEl = _f[0], setDatePickerAnchorEl = _f[1];
    /**
     * The current filter value
     */
    var _g = useState(function () {
        return Object.fromEntries(Object.entries(filters).map(function (_a) {
            var name = _a[0], filter = _a[1];
            return [
                name,
                filter.defaultValue,
            ];
        }));
    }), filterValues = _g[0], setFilterValues = _g[1];
    var prevWeek = useCallback(function () {
        setWeekOffset(function (prev) { return prev - 1; });
    }, []);
    var nextWeek = useCallback(function () {
        setWeekOffset(function (prev) { return prev + 1; });
    }, []);
    var handleFilterChange = useCallback(function (evt) {
        var value = evt.target.type === "checkbox"
            ? evt.target.checked
            : evt.target.value;
        setFilterValues(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[evt.target.name] = value, _a)));
        });
        if (!props.filters)
            return;
        var changeHandler = props.filters[evt.target.name].onChange;
        if (changeHandler)
            changeHandler(value);
    }, [props.filters]);
    var _h = useState(null), filterSettingsAnchorEl = _h[0], setFilterSettingsAnchorEl = _h[1];
    var openFilterSettings = useCallback(function (evt) {
        setFilterSettingsAnchorEl(evt.currentTarget);
    }, []);
    var closeFiltersMenu = useCallback(function () {
        setFilterSettingsAnchorEl(null);
    }, []);
    var today = useCallback(function () {
        setWeekOffset(0);
    }, []);
    var setWeek = useCallback(function (date) {
        if (!date)
            return;
        var start = nowNormalized();
        var end = normalizeMoment(date);
        var week = end.diff(start, "week");
        setWeekOffset(week);
        setDatePickerAnchorEl(null);
    }, []);
    var openDatePicker = useCallback(function (evt) {
        setDatePickerAnchorEl(evt.currentTarget);
    }, []);
    var closeDatePicker = useCallback(function () {
        setDatePickerAnchorEl(null);
    }, []);
    useEffect(function () {
        var langChangeHandler = function () {
            setData(null);
            setLoadError(null);
        };
        i18n.on("languageChanged", langChangeHandler);
        return function () {
            i18n.off("languageChanged", langChangeHandler);
        };
    }, [i18n]);
    useEffect(function () {
        setData(null);
        setLoadError(null);
        // fetch data
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var data_1, loadError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, loadData(weekOffset, filterValues)];
                    case 1:
                        data_1 = _a.sent();
                        setData(data_1);
                        return [3 /*break*/, 3];
                    case 2:
                        loadError_1 = _a.sent();
                        setLoadError(loadError_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, [filterValues, loadData, weekOffset]);
    var now = moment();
    var weekday = now.weekday();
    var weekdays = [0, 1, 2, 3, 4, 5, 6].map(function (day) { return day - weekday; });
    var prevDate = null;
    return (React.createElement(Grid, { container: true, alignItems: "stretch", alignContent: "space-between" },
        React.createElement(Grid, { item: true, xs: 12, container: true, wrap: "nowrap" },
            React.createElement(Grid, { item: true, xs: true },
                React.createElement(Grid, { container: true },
                    React.createElement(Grid, { item: true },
                        React.createElement(Button, { onClick: today, className: classes.todayBtn },
                            t("standalone.schedule.today"),
                            " (",
                            now
                                .toDate()
                                .toLocaleDateString(i18n.language, ToDateLocaleStringOptions),
                            ")")),
                    React.createElement(Grid, { item: true }, filterCount > 0 && (React.createElement(Box, { px: 2, className: classes.filterWrapper }, (function () {
                        var _a = Object.entries(filters)[0], name = _a[0], filter = _a[1];
                        return (React.createElement(ScheduleFilterRenderer, __assign({}, filter, { name: name, value: filterValues[name], onChange: handleFilterChange, inline: "weekly" })));
                    })()))))),
            React.createElement(Grid, { item: true },
                React.createElement(Grid, { container: true, justifyContent: "center" },
                    React.createElement(Grid, { item: true },
                        React.createElement(IconButton, { onClick: prevWeek, size: "large" },
                            React.createElement(ArrowBackIos, null)),
                        React.createElement("span", { onClick: openDatePicker, className: classes.week },
                            t("standalone.schedule.week"),
                            " ",
                            nowNormalized().add(weekOffset, "week").week(),
                            " ",
                            nowNormalized().add(weekOffset, "week").weekYear()),
                        React.createElement("div", { className: classes.picker },
                            React.createElement(LocalizationProvider, { dateAdapter: AdapterMoment, adapterLocale: i18n.language },
                                React.createElement(DatePicker, { format: "II RRRR", open: datePickerAnchorEl != null, label: t("standalone.schedule.week"), value: nowNormalized().add(weekOffset, "week"), onChange: setWeek, onClose: closeDatePicker }))),
                        React.createElement(IconButton, { onClick: nextWeek, size: "large" },
                            React.createElement(ArrowForwardIos, null))))),
            React.createElement(Grid, { item: true, xs: true, container: true, justifyContent: "flex-end" }, filterCount > 1 && (React.createElement(Grid, { item: true },
                React.createElement(Box, { px: 2, className: classes.filterWrapper }, filterCount > 2 ? (React.createElement(React.Fragment, null,
                    React.createElement(IconButton, { onClick: openFilterSettings },
                        React.createElement(SettingsIcon, null)),
                    React.createElement(Menu, { open: filterSettingsAnchorEl != null, anchorEl: filterSettingsAnchorEl, onClose: closeFiltersMenu },
                        React.createElement(Box, { p: 1 },
                            React.createElement(Grid, { container: true, spacing: 1 }, Object.entries(filters).map(function (_a, idx) {
                                var name = _a[0], filter = _a[1];
                                return idx !== 0 && (React.createElement(Grid, { key: name, item: true, xs: 12 },
                                    React.createElement(ScheduleFilterRenderer, __assign({}, filter, { name: name, value: filter.type === "select"
                                            ? filterValues[name]
                                            : filterValues[name], onChange: handleFilterChange }))));
                            })))))) : ((function () {
                    var _a = Object.entries(filters)[1], name = _a[0], filter = _a[1];
                    return (React.createElement(ScheduleFilterRenderer, __assign({}, filter, { name: name, value: filterValues[name], onChange: handleFilterChange, inline: "weekly" })));
                })())))))),
        loadError && (React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Typography, { align: "center" }, loadError.message))),
        !data && !loadError && (React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Grid, { container: true, justifyContent: "space-around" },
                React.createElement(CircularProgress, null)))),
        data && (React.createElement(Grid, { item: true, xs: 12, container: true, alignItems: "stretch", alignContent: "space-between", wrap: "nowrap" }, weekdays.map(function (day, dayIdx) {
            var date = now.clone().add(weekOffset, "weeks").add(day, "days");
            var diffDay = !prevDate || prevDate.day() !== date.day();
            var diffMonth = !prevDate || prevDate.month() !== date.month();
            var diffYear = prevDate && prevDate.year() !== date.year();
            prevDate = date;
            var formattedDate = "";
            if (diffYear)
                formattedDate += "".concat(date.year(), " ");
            if (diffMonth)
                formattedDate += "".concat(date.format("MMMM"), " ");
            if (diffDay)
                formattedDate += date.format("DD");
            var dayData = data[(date.weekday() + date.localeData().firstDayOfWeek()) % 7];
            return (React.createElement(WeekViewDay, { key: day, dayIdx: dayIdx, day: date, date: formattedDate, data: dayData }));
        })))));
};
export default React.memo(WeekView);
