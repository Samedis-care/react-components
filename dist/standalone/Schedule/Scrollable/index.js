import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Divider, Grid, IconButton, Menu, styled, useThemeProps, } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import moment from "moment";
import ScrollableScheduleWeek from "./ScrollableScheduleWeek";
import InfiniteScroll from "../../InfiniteScroll";
import combineClassNames from "../../../utils/combineClassNames";
import useCCTranslations from "../../../utils/useCCTranslations";
import ScrollableFilterRenderer from "../Common/ScheduleFilterRenderers";
import throwError from "../../../utils/throwError";
const TodayButtonWrapper = styled(Grid, {
    name: "CcScrollableSchedule",
    slot: "today",
})(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
}));
const TodayButton = styled(Button, {
    name: "CcScrollableSchedule",
    slot: "todayBtn",
})({
    textTransform: "none",
    textAlign: "left",
    color: "inherit",
    display: "block",
});
const StyledInfiniteScroll = styled(InfiniteScroll, {
    name: "CcScrollableSchedule",
    slot: "scroller",
})(({ theme }) => ({
    overflow: "auto",
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    position: "relative",
}));
const FilterSettingsIcon = styled(SettingsIcon, {
    name: "CcScrollableSchedule",
    slot: "filterSettingsBtn",
})(({ theme }) => ({
    color: theme.palette.primary.contrastText,
}));
const FilterWrapper = styled(Box, {
    name: "CcScrollableSchedule",
    slot: "filterWrapper",
})({
    top: "50%",
    position: "relative",
    transform: "translateY(-50%)",
});
const preventAction = (evt) => {
    evt.stopPropagation();
};
const EMPTY_FILTERS = {};
const NO_ACTIONS = [];
const ScrollableSchedule = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcScrollableSchedule" });
    const { loadWeekCallback, wrapperClass, className, classes } = props;
    const filters = props.filters ?? EMPTY_FILTERS;
    const actions = props.actions ?? NO_ACTIONS;
    const { t, i18n } = useCCTranslations();
    const todayElem = useRef(null);
    const scrollElem = useRef(null);
    const getDefaultState = useCallback(() => ({
        items: [],
        dataOffsetTop: -1,
        dataOffsetBottom: 0,
        today: moment(),
        filterValues: filters
            ? Object.fromEntries(Object.entries(filters).map(([key, filter]) => [
                key,
                filter.defaultValue,
            ]))
            : {},
    }), [filters]);
    const [state, setState] = useState(getDefaultState);
    useEffect(() => {
        const onLanguageChanged = () => {
            setState((prev) => ({
                ...getDefaultState(),
                filterValues: prev.filterValues,
            }));
        };
        i18n.on("languageChanged", onLanguageChanged);
        return () => {
            i18n.off("languageChanged", onLanguageChanged);
        };
    }, [getDefaultState, i18n]);
    /**
     * Loads more data in the infinite scroll
     * @param top load more data on top? (if false loads more data at bottom)
     */
    const loadMore = useCallback((top) => {
        const mkItem = (state) => {
            const page = top ? state.dataOffsetTop : state.dataOffsetBottom;
            return (_jsx(ScrollableScheduleWeek, { loadData: () => loadWeekCallback(page, state.filterValues), setTodayElement: (elem) => (todayElem.current = elem), moment: state.today.clone().add(page, "weeks") }, page.toString()));
        };
        if (top) {
            setState((prevState) => ({
                ...prevState,
                items: [mkItem(prevState), ...prevState.items],
                dataOffsetTop: prevState.dataOffsetTop - 1,
            }));
        }
        else {
            setState((prevState) => ({
                ...prevState,
                items: [...prevState.items, mkItem(prevState)],
                dataOffsetBottom: prevState.dataOffsetBottom + 1,
            }));
        }
    }, [loadWeekCallback]);
    /**
     * Loads more data on top of the scroller
     */
    const loadMoreTop = useCallback(() => loadMore(true), [loadMore]);
    /**
     * Loads more data at the bottom of the scroller
     */
    const loadMoreBottom = useCallback(() => loadMore(false), [loadMore]);
    const jumpToToday = useCallback(() => {
        if (!todayElem.current ||
            !scrollElem.current ||
            !scrollElem.current.wrapper) {
            return;
        }
        scrollElem.current.wrapper.scrollTop = todayElem.current.offsetTop;
    }, []);
    const handleFilterChange = useCallback((evt) => {
        const value = evt.target.type === "checkbox"
            ? evt.target.checked
            : evt.target.value;
        setState((prev) => ({
            ...getDefaultState(),
            filterValues: {
                ...prev.filterValues,
                [evt.target.name]: value,
            },
        }));
        if (!props.filters)
            return;
        const changeHandler = props.filters[evt.target.name].onChange;
        if (changeHandler)
            changeHandler(value);
    }, [getDefaultState, props.filters]);
    const [filterSettingsAnchorEl, setFilterSettingsAnchorEl] = useState(null);
    const openFilterSettings = useCallback((evt) => {
        setFilterSettingsAnchorEl(evt.currentTarget);
    }, []);
    const closeFiltersMenu = useCallback(() => {
        setFilterSettingsAnchorEl(null);
    }, []);
    const filterCount = filters ? Object.keys(filters).length : 0;
    return (_jsxs(Grid, { container: true, className: className, children: [_jsx(TodayButtonWrapper, { size: 12, className: classes?.today, onClick: jumpToToday, children: _jsxs(Grid, { container: true, sx: { justifyContent: "space-between" }, children: [_jsx(Grid, { children: _jsx(TodayButton, { className: classes?.todayBtn, onClick: jumpToToday, fullWidth: true, children: _jsx(Box, { sx: { m: 2 }, children: state.today.format("ddd DD MMMM") }) }) }), _jsx(Grid, { children: filterCount + actions.length > 0 && (_jsx(FilterWrapper, { sx: { px: 2 }, className: classes?.filterWrapper, onClick: preventAction, children: filterCount + actions.length > 1 ? (_jsxs(_Fragment, { children: [_jsx(IconButton, { onClick: openFilterSettings, "aria-label": t("standalone.schedule.filter-settings"), children: _jsx(FilterSettingsIcon, { className: classes?.filterSettingsBtn }) }), _jsx(Menu, { open: filterSettingsAnchorEl != null, anchorEl: filterSettingsAnchorEl, onClose: closeFiltersMenu, children: _jsx(Box, { sx: { p: 1 }, children: _jsxs(Grid, { container: true, spacing: 1, children: [Object.entries(filters).map(([name, filter]) => (_jsx(Grid, { size: 12, children: _jsx(ScrollableFilterRenderer, { ...filter, name: name, value: filter.type === "select"
                                                                    ? state.filterValues[name]
                                                                    : state.filterValues[name], onChange: handleFilterChange }) }, "filter-" + name))), filterCount > 0 && (_jsx(Grid, { size: 12, children: _jsx(Divider, {}) }, "divider")), actions.map((action) => (_jsx(Grid, { size: 12, children: _jsx(Button, { onClick: action.onClick, disabled: action.disabled, fullWidth: true, children: action.label }) }, "action-" + action.id)))] }) }) })] })) : filterCount > 0 ? ((() => {
                                    const [name, filter] = Object.entries(filters)[0];
                                    return (_jsx(ScrollableFilterRenderer, { ...filter, name: name, value: state.filterValues[name], onChange: handleFilterChange, inline: "scrollable" }, "filter-" + name));
                                })()) : actions.length > 0 ? ((() => {
                                    const action = actions[0];
                                    return (_jsx(Button, { onClick: action.onClick, disabled: action.disabled, children: action.label }, "action-" + action.id));
                                })()) : (throwError("code should be unreachable")) })) })] }) }), _jsx(Grid, { size: 12, children: _jsx(StyledInfiniteScroll, { className: combineClassNames([wrapperClass, classes?.scroller]), loadMoreTop: loadMoreTop, loadMoreBottom: loadMoreBottom, ref: scrollElem, children: _jsx(Box, { sx: { m: 2 }, children: _jsx(Grid, { container: true, spacing: 2, children: state.items }) }) }) })] }));
};
export default React.memo(ScrollableSchedule);
