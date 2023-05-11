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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Grid, Box, Button, IconButton, Menu } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import moment from "moment";
import ScrollableScheduleWeek from "./ScrollableScheduleWeek";
import InfiniteScroll from "../../InfiniteScroll";
import { combineClassNames } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";
import makeStyles from "@mui/styles/makeStyles";
import ScrollableFilterRenderer from "../Common/ScheduleFilterRenderers";
var useStyles = makeStyles(function (theme) { return ({
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
    filterSettingsBtn: {
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    filterWrapper: {
        top: "50%",
        position: "relative",
        transform: "translateY(-50%)",
    },
}); }, { name: "CcScrollableSchedule" });
var preventAction = function (evt) {
    evt.stopPropagation();
};
var EMPTY_FILTERS = {};
var ScrollableSchedule = function (props) {
    var _a;
    var loadWeekCallback = props.loadWeekCallback, wrapperClass = props.wrapperClass;
    var filters = (_a = props.filters) !== null && _a !== void 0 ? _a : EMPTY_FILTERS;
    var i18n = useCCTranslations().i18n;
    var classes = useStyles();
    var todayElem = useRef(null);
    var scrollElem = useRef(null);
    var getDefaultState = useCallback(function () { return ({
        items: [],
        dataOffsetTop: -1,
        dataOffsetBottom: 0,
        today: moment(),
        filterValues: filters
            ? Object.fromEntries(Object.entries(filters).map(function (_a) {
                var key = _a[0], filter = _a[1];
                return [
                    key,
                    filter.defaultValue,
                ];
            }))
            : {},
    }); }, [filters]);
    var _b = useState(getDefaultState), state = _b[0], setState = _b[1];
    useEffect(function () {
        var onLanguageChanged = function () {
            setState(function (prev) { return (__assign(__assign({}, getDefaultState()), { filterValues: prev.filterValues })); });
        };
        i18n.on("languageChanged", onLanguageChanged);
        return function () {
            i18n.off("languageChanged", onLanguageChanged);
        };
    }, [getDefaultState, i18n]);
    /**
     * Loads more data in the infinite scroll
     * @param top load more data on top? (if false loads more data at bottom)
     */
    var loadMore = useCallback(function (top) {
        var page = top ? state.dataOffsetTop : state.dataOffsetBottom;
        var item = (React.createElement(ScrollableScheduleWeek, { key: page.toString(), loadData: function () { return loadWeekCallback(page, state.filterValues); }, setTodayElement: function (elem) {
                return (todayElem.current = elem);
            }, moment: state.today.clone().add(page - 1, "weeks") }));
        if (top) {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { items: __spreadArray([item], prevState.items, true), dataOffsetTop: prevState.dataOffsetTop - 1 })); });
        }
        else {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { items: __spreadArray(__spreadArray([], prevState.items, true), [item], false), dataOffsetBottom: prevState.dataOffsetBottom + 1 })); });
        }
    }, [
        loadWeekCallback,
        state.dataOffsetBottom,
        state.dataOffsetTop,
        state.filterValues,
        state.today,
    ]);
    /**
     * Loads more data on top of the scroller
     */
    var loadMoreTop = useCallback(function () { return loadMore(true); }, [loadMore]);
    /**
     * Loads more data at the bottom of the scroller
     */
    var loadMoreBottom = useCallback(function () { return loadMore(false); }, [loadMore]);
    var jumpToToday = useCallback(function () {
        if (!todayElem.current ||
            !scrollElem.current ||
            !scrollElem.current.wrapper) {
            return;
        }
        scrollElem.current.wrapper.scrollTop = todayElem.current.offsetTop;
    }, []);
    var handleFilterChange = useCallback(function (evt) {
        var value = evt.target.type === "checkbox"
            ? evt.target.checked
            : evt.target.value;
        setState(function (prev) {
            var _a;
            return (__assign(__assign({}, getDefaultState()), { filterValues: __assign(__assign({}, prev.filterValues), (_a = {}, _a[evt.target.name] = value, _a)) }));
        });
        if (!props.filters)
            return;
        var changeHandler = props.filters[evt.target.name].onChange;
        if (changeHandler)
            changeHandler(value);
    }, [getDefaultState, props.filters]);
    var _c = useState(null), filterSettingsAnchorEl = _c[0], setFilterSettingsAnchorEl = _c[1];
    var openFilterSettings = useCallback(function (evt) {
        setFilterSettingsAnchorEl(evt.currentTarget);
    }, []);
    var closeFiltersMenu = useCallback(function () {
        setFilterSettingsAnchorEl(null);
    }, []);
    var filterCount = filters ? Object.keys(filters).length : 0;
    return (React.createElement(Grid, { container: true },
        React.createElement(Grid, { item: true, xs: 12, className: classes.today, onClick: jumpToToday },
            React.createElement(Grid, { container: true, justifyContent: "space-between" },
                React.createElement(Grid, { item: true },
                    React.createElement(Button, { className: classes.todayBtn, onClick: jumpToToday, fullWidth: true },
                        React.createElement(Box, { m: 2 }, state.today.format("ddd DD MMMM")))),
                React.createElement(Grid, { item: true }, filterCount > 0 && (React.createElement(Box, { px: 2, className: classes.filterWrapper, onClick: preventAction }, filterCount > 1 ? (React.createElement(React.Fragment, null,
                    React.createElement(IconButton, { onClick: openFilterSettings },
                        React.createElement(SettingsIcon, { className: classes.filterSettingsBtn })),
                    React.createElement(Menu, { open: filterSettingsAnchorEl != null, anchorEl: filterSettingsAnchorEl, onClose: closeFiltersMenu },
                        React.createElement(Box, { p: 1 },
                            React.createElement(Grid, { container: true, spacing: 1 }, Object.entries(filters).map(function (_a) {
                                var name = _a[0], filter = _a[1];
                                return (React.createElement(Grid, { key: name, item: true, xs: 12 },
                                    React.createElement(ScrollableFilterRenderer, __assign({}, filter, { name: name, value: filter.type === "select"
                                            ? state.filterValues[name]
                                            : state.filterValues[name], onChange: handleFilterChange }))));
                            })))))) : ((function () {
                    var _a = Object.entries(filters)[0], name = _a[0], filter = _a[1];
                    return (React.createElement(ScrollableFilterRenderer, __assign({}, filter, { name: name, value: state.filterValues[name], onChange: handleFilterChange, inline: "scrollable" })));
                })())))))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(InfiniteScroll, { className: combineClassNames([wrapperClass, classes.scroller]), loadMoreTop: loadMoreTop, loadMoreBottom: loadMoreBottom, ref: scrollElem },
                React.createElement(Box, { m: 2 },
                    React.createElement(Grid, { container: true, spacing: 2 }, state.items))))));
};
export default React.memo(ScrollableSchedule);
