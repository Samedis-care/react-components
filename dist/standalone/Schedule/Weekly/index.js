var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import React, { PureComponent } from "react";
import WeekViewDay from "./WeekViewDay";
import moment from "moment";
import { Box, CircularProgress, createStyles, IconButton, withStyles, } from "@material-ui/core";
import { Button, Typography, Grid } from "@material-ui/core";
import { ArrowForwardIos, ArrowBackIos } from "@material-ui/icons";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { ToDateLocaleStringOptions } from "../../../constants";
import useCCTranslations from "../../../utils/useCCTranslations";
var WeekView = /** @class */ (function (_super) {
    __extends(WeekView, _super);
    function WeekView(props) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, props) || this;
        _this.prevWeek = function () {
            return _this.setState(function (prevState) { return ({
                weekOffset: prevState.weekOffset - 1,
                data: null,
                loadError: null,
            }); }, function () {
                void _this.fetchData();
            });
        };
        _this.nextWeek = function () {
            return _this.setState(function (prevState) { return ({
                weekOffset: prevState.weekOffset + 1,
                data: null,
                loadError: null,
            }); }, function () {
                void _this.fetchData();
            });
        };
        _this.handleFilterSelect = function (evt) {
            return _this.setState({
                data: null,
                loadError: null,
                filterValue: evt.target.value,
            }, function () {
                void _this.fetchData();
            });
        };
        _this.today = function () {
            return _this.setState({
                weekOffset: 0,
                data: null,
                loadError: null,
            }, function () {
                void _this.fetchData();
            });
        };
        _this.setWeek = function (date) {
            var start = _this.nowNormalized();
            var end = _this.momentNormalize(moment(date));
            var week = end.diff(start, "week");
            _this.setState({
                weekOffset: week,
                data: null,
                loadError: null,
                datePickerOpen: false,
            }, function () {
                void _this.fetchData();
            });
        };
        _this.fetchData = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, loadError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.props.loadData(this.state.weekOffset, this.state.filterValue)];
                    case 1:
                        data = _a.sent();
                        this.setState({
                            data: data,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        loadError_1 = _a.sent();
                        this.setState({
                            loadError: loadError_1,
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.nowNormalized = function () { return _this.momentNormalize(moment()); };
        _this.momentNormalize = function (instance) {
            return instance.weekday(0).hour(0).minute(0).second(0).millisecond(0);
        };
        _this.openDatePicker = function () {
            return _this.setState({
                datePickerOpen: true,
            });
        };
        _this.closeDatePicker = function () {
            return _this.setState({
                datePickerOpen: false,
            });
        };
        _this.state = {
            weekOffset: 0,
            data: null,
            loadError: null,
            datePickerOpen: false,
            filterValue: (_b = (_a = props.filter) === null || _a === void 0 ? void 0 : _a.defaultValue) !== null && _b !== void 0 ? _b : null,
        };
        return _this;
    }
    WeekView.prototype.componentDidMount = function () {
        var _this = this;
        void this.fetchData();
        this.props.i18n.on("languageChanged", function () {
            void _this.fetchData();
        });
    };
    WeekView.prototype.componentWillUnmount = function () {
        var _this = this;
        this.props.i18n.off("languageChanged", function () {
            void _this.fetchData();
        });
    };
    WeekView.prototype.render = function () {
        var _this = this;
        var _a;
        var now = moment();
        var weekday = now.weekday();
        var weekdays = [0, 1, 2, 3, 4, 5, 6].map(function (day) { return day - weekday; });
        var prevDate = null;
        return (React.createElement(Grid, { container: true, alignItems: "stretch", alignContent: "space-between" },
            React.createElement(Grid, { item: true, xs: 12, container: true, wrap: "nowrap" },
                React.createElement(Grid, { item: true, xs: true },
                    React.createElement(Grid, { container: true },
                        React.createElement(Grid, { item: true },
                            React.createElement(Button, { onClick: this.today, className: this.props.classes.todayBtn },
                                this.props.t("standalone.schedule.today"),
                                " (",
                                now
                                    .toDate()
                                    .toLocaleDateString(this.props.i18n.language, ToDateLocaleStringOptions),
                                ")")),
                        React.createElement(Grid, { item: true }, this.props.filter && (React.createElement(Box, { px: 2, className: this.props.classes.filterWrapper },
                            React.createElement("select", { className: this.props.classes.filterSelect, value: (_a = this.state.filterValue) !== null && _a !== void 0 ? _a : "", onChange: this.handleFilterSelect }, Object.entries(this.props.filter.options).map(function (_a) {
                                var value = _a[0], label = _a[1];
                                return (React.createElement("option", { value: value, key: value }, label));
                            }))))))),
                React.createElement(Grid, { item: true },
                    React.createElement(Grid, { container: true, justify: "center" },
                        React.createElement(Grid, { item: true },
                            React.createElement(IconButton, { onClick: this.prevWeek },
                                React.createElement(ArrowBackIos, null)),
                            React.createElement("span", { onClick: this.openDatePicker, className: this.props.classes.week },
                                this.props.t("standalone.schedule.week"),
                                " ",
                                this.nowNormalized()
                                    .add(this.state.weekOffset, "week")
                                    .week(),
                                " ",
                                this.nowNormalized()
                                    .add(this.state.weekOffset, "week")
                                    .weekYear()),
                            React.createElement("div", { className: this.props.classes.picker },
                                "qsq",
                                React.createElement(MuiPickersUtilsProvider, { utils: MomentUtils },
                                    React.createElement(DatePicker, { variant: "dialog", format: "II RRRR", open: this.state.datePickerOpen, label: this.props.t("standalone.schedule.week"), value: this.nowNormalized()
                                            .add(this.state.weekOffset, "week")
                                            .toDate(), onChange: this.setWeek, 
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore not declared in typescript def
                                        onDismiss: this.closeDatePicker }))),
                            React.createElement(IconButton, { onClick: this.nextWeek },
                                React.createElement(ArrowForwardIos, null))))),
                React.createElement(Grid, { item: true, xs: true })),
            this.state.loadError && (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Typography, { align: "center" }, this.state.loadError.message))),
            !this.state.data && !this.state.loadError && (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Grid, { container: true, justify: "space-around" },
                    React.createElement(CircularProgress, null)))),
            this.state.data && (React.createElement(Grid, { item: true, xs: 12, container: true, alignItems: "stretch", alignContent: "space-between", wrap: "nowrap", className: this.props.classes.content }, weekdays.map(function (day, dayIdx) {
                var data = _this.state.data;
                if (!data)
                    return null;
                var date = now
                    .clone()
                    .add(_this.state.weekOffset, "weeks")
                    .add(day, "days");
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
    return WeekView;
}(PureComponent));
var styles = createStyles({
    todayBtn: {
        height: "100%",
    },
    week: {
        cursor: "pointer",
    },
    picker: {
        display: "none",
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
});
var WeekViewWithoutTranslation = withStyles(styles)(WeekView);
var WeekViewWithTranslation = function (props) {
    var _a = useCCTranslations(), i18n = _a.i18n, t = _a.t, tReady = _a.ready;
    return (React.createElement(WeekViewWithoutTranslation, __assign({}, props, { i18n: i18n, t: t, tReady: tReady })));
};
export default WeekViewWithTranslation;
