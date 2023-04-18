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
import { CircularProgress, Divider, Grid } from "@mui/material";
import ScrollableScheduleDay from "./ScrollableScheduleDay";
import moment from "moment";
import useCCTranslations from "../../../utils/useCCTranslations";
var ScrollableScheduleWeek = /** @class */ (function (_super) {
    __extends(ScrollableScheduleWeek, _super);
    function ScrollableScheduleWeek(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: null,
            loadError: null,
        };
        return _this;
    }
    ScrollableScheduleWeek.prototype.componentDidMount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.props.loadData()];
                    case 1:
                        data = _a.sent();
                        this.setState({
                            data: data,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        this.setState({
                            loadError: e_1,
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ScrollableScheduleWeek.prototype.render = function () {
        if (this.state.loadError) {
            return (React.createElement(Grid, { item: true, xs: 12 }, this.state.loadError.message));
        }
        if (!this.state.data) {
            return (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Grid, { container: true, justifyContent: "space-around" },
                    React.createElement(CircularProgress, null))));
        }
        var firstDay = this.props.moment;
        firstDay.subtract(firstDay.weekday(), "days");
        var dayItems = [];
        var now = moment();
        for (var day = 0; day < 7; ++day) {
            var dayMoment = firstDay.clone().add(day, "days");
            if (dayMoment.dayOfYear() === now.dayOfYear() &&
                dayMoment.year() === now.year()) {
                dayItems.push(React.createElement(ScrollableScheduleDay, { key: day, data: this.state.data[day], refFwd: this.props.setTodayElement, moment: dayMoment }));
            }
            else {
                dayItems.push(React.createElement(ScrollableScheduleDay, { key: "".concat(day), data: this.state.data[day], moment: dayMoment }));
            }
        }
        var endOfWeek = firstDay.clone().add(6, "days");
        return (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Divider, null)),
            React.createElement(Grid, { item: true, xs: 1 }),
            React.createElement(Grid, { item: true, xs: 11 },
                this.props.t("standalone.schedule.week"),
                " ",
                firstDay.week(),
                ",",
                " ",
                firstDay.format("DD MMM"),
                " - ",
                endOfWeek.format("DD MMM")),
            dayItems));
    };
    return ScrollableScheduleWeek;
}(PureComponent));
var ScrollableScheduleWeekWithTranslation = function (props) {
    var _a = useCCTranslations(), i18n = _a.i18n, t = _a.t, tReady = _a.ready;
    return (React.createElement(ScrollableScheduleWeek, __assign({}, props, { i18n: i18n, t: t, tReady: tReady })));
};
export default ScrollableScheduleWeekWithTranslation;
