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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { PureComponent } from "react";
import { Grid, withStyles, Box, Button, createStyles, } from "@material-ui/core";
import moment from "moment";
import ScrollableScheduleWeek from "./ScrollableScheduleWeek";
import InfiniteScroll from "../../InfiniteScroll";
import i18n from "../../../i18n";
import { combineClassNames } from "../../../utils";
var ScrollableSchedule = /** @class */ (function (_super) {
    __extends(ScrollableSchedule, _super);
    function ScrollableSchedule(props) {
        var _this = _super.call(this, props) || this;
        _this.todayElem = null;
        _this.scrollElem = null;
        _this.getDefaultState = function () {
            var _a, _b;
            return ({
                items: [],
                dataOffsetTop: -1,
                dataOffsetBottom: 0,
                today: moment(),
                filterValue: (_b = (_a = _this.props.filter) === null || _a === void 0 ? void 0 : _a.defaultValue) !== null && _b !== void 0 ? _b : null,
            });
        };
        /**
         * Loads more data on top of the scroller
         */
        _this.loadMoreTop = function () { return _this.loadMore(true); };
        /**
         * Loads more data at the bottom of the scroller
         */
        _this.loadMoreBottom = function () { return _this.loadMore(false); };
        /**
         * Sets the scroller reference to control scrolling
         * @param elem The scroller element
         */
        _this.setScrollElemRef = function (elem) { return (_this.scrollElem = elem); };
        /**
         * Loads more data in the infinite scroll
         * @param top load more data on top? (if false loads more data at bottom)
         */
        _this.loadMore = function (top) {
            var page = top ? _this.state.dataOffsetTop : _this.state.dataOffsetBottom;
            var item = (React.createElement(ScrollableScheduleWeek, { key: page.toString(), loadData: function () {
                    return _this.props.loadWeekCallback(page, _this.state.filterValue);
                }, setTodayElement: function (elem) { return (_this.todayElem = elem); }, moment: _this.state.today.clone().add(page - 1, "weeks") }));
            if (top) {
                _this.setState(function (prevState) { return ({
                    items: __spreadArray([item], prevState.items, true),
                    dataOffsetTop: prevState.dataOffsetTop - 1,
                }); });
            }
            else {
                _this.setState(function (prevState) { return ({
                    items: __spreadArray(__spreadArray([], prevState.items, true), [item], false),
                    dataOffsetBottom: prevState.dataOffsetBottom + 1,
                }); });
            }
        };
        _this.jumpToToday = function () {
            if (!_this.todayElem || !_this.scrollElem || !_this.scrollElem.wrapper) {
                return;
            }
            _this.scrollElem.wrapper.scrollTop = _this.todayElem.offsetTop;
        };
        _this.preventAction = function (evt) {
            evt.stopPropagation();
        };
        _this.handleFilterSelect = function (evt) {
            _this.setState(__assign(__assign({}, _this.getDefaultState()), { filterValue: evt.target.value }));
        };
        _this.onLanguageChanged = function () { return _this.setState(_this.getDefaultState()); };
        _this.state = _this.getDefaultState();
        return _this;
    }
    ScrollableSchedule.prototype.componentDidMount = function () {
        i18n.on("languageChanged", this.onLanguageChanged);
    };
    ScrollableSchedule.prototype.componentWillUnmount = function () {
        i18n.off("languageChanged", this.onLanguageChanged);
    };
    ScrollableSchedule.prototype.render = function () {
        var _a;
        return (React.createElement(Grid, { container: true },
            React.createElement(Grid, { item: true, xs: 12, className: this.props.classes.today, onClick: this.jumpToToday },
                React.createElement(Grid, { container: true, justify: "space-between" },
                    React.createElement(Grid, { item: true },
                        React.createElement(Button, { className: this.props.classes.todayBtn, onClick: this.jumpToToday, fullWidth: true },
                            React.createElement(Box, { m: 2 }, this.state.today.format("ddd DD MMMM")))),
                    React.createElement(Grid, { item: true }, this.props.filter && (React.createElement(Box, { px: 2, className: this.props.classes.filterWrapper },
                        React.createElement("select", { onClick: this.preventAction, className: this.props.classes.filterSelect, value: (_a = this.state.filterValue) !== null && _a !== void 0 ? _a : "", onChange: this.handleFilterSelect }, Object.entries(this.props.filter.options).map(function (_a) {
                            var value = _a[0], label = _a[1];
                            return (React.createElement("option", { value: value, key: value }, label));
                        }))))))),
            React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(InfiniteScroll, { className: combineClassNames([
                        this.props.wrapperClass,
                        this.props.classes.scroller,
                    ]), loadMoreTop: this.loadMoreTop, loadMoreBottom: this.loadMoreBottom, ref: this.setScrollElemRef },
                    React.createElement(Box, { m: 2 },
                        React.createElement(Grid, { container: true, spacing: 2 }, this.state.items))))));
    };
    return ScrollableSchedule;
}(PureComponent));
var styles = createStyles(function (theme) { return ({
    today: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
        borderRadius: "".concat(theme.shape.borderRadius, "px ").concat(theme.shape.borderRadius, "px 0 0"),
    },
    todayBtn: {
        textTransform: "none",
        textAlign: "left",
        color: "inherit",
        display: "block",
    },
    scroller: {
        overflow: "auto",
        borderRadius: "0 0 ".concat(theme.shape.borderRadius, "px ").concat(theme.shape.borderRadius, "px"),
        position: "relative",
    },
    filterWrapper: {
        top: "50%",
        position: "relative",
        transform: "translateY(-50%)",
    },
    filterSelect: {
        backgroundColor: "transparent",
        border: "none",
        color: theme.palette.getContrastText(theme.palette.primary.main),
        cursor: "pointer",
    },
}); });
export default withStyles(styles)(ScrollableSchedule);
