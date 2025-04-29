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
    const { i18n } = useCCTranslations();
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
            return (React.createElement(ScrollableScheduleWeek, { key: page.toString(), loadData: () => loadWeekCallback(page, state.filterValues), setTodayElement: (elem) => (todayElem.current = elem), moment: state.today.clone().add(page, "weeks") }));
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
    return (React.createElement(Grid, { container: true, className: className },
        React.createElement(TodayButtonWrapper, { size: 12, className: classes?.today, onClick: jumpToToday },
            React.createElement(Grid, { container: true, justifyContent: "space-between" },
                React.createElement(Grid, null,
                    React.createElement(TodayButton, { className: classes?.todayBtn, onClick: jumpToToday, fullWidth: true },
                        React.createElement(Box, { m: 2 }, state.today.format("ddd DD MMMM")))),
                React.createElement(Grid, null, filterCount + actions.length > 0 && (React.createElement(FilterWrapper, { px: 2, className: classes?.filterWrapper, onClick: preventAction }, filterCount + actions.length > 1 ? (React.createElement(React.Fragment, null,
                    React.createElement(IconButton, { onClick: openFilterSettings },
                        React.createElement(FilterSettingsIcon, { className: classes?.filterSettingsBtn })),
                    React.createElement(Menu, { open: filterSettingsAnchorEl != null, anchorEl: filterSettingsAnchorEl, onClose: closeFiltersMenu },
                        React.createElement(Box, { p: 1 },
                            React.createElement(Grid, { container: true, spacing: 1 },
                                Object.entries(filters).map(([name, filter]) => (React.createElement(Grid, { key: "filter-" + name, size: 12 },
                                    React.createElement(ScrollableFilterRenderer, { ...filter, name: name, value: filter.type === "select"
                                            ? state.filterValues[name]
                                            : state.filterValues[name], onChange: handleFilterChange })))),
                                filterCount > 0 && (React.createElement(Grid, { key: "divider", size: 12 },
                                    React.createElement(Divider, null))),
                                actions.map((action) => (React.createElement(Grid, { key: "action-" + action.id, size: 12 },
                                    React.createElement(Button, { onClick: action.onClick, disabled: action.disabled, fullWidth: true }, action.label))))))))) : filterCount > 0 ? ((() => {
                    const [name, filter] = Object.entries(filters)[0];
                    return (React.createElement(ScrollableFilterRenderer, { key: "filter-" + name, ...filter, name: name, value: state.filterValues[name], onChange: handleFilterChange, inline: "scrollable" }));
                })()) : actions.length > 0 ? ((() => {
                    const action = actions[0];
                    return (React.createElement(Button, { key: "action-" + action.id, onClick: action.onClick, disabled: action.disabled }, action.label));
                })()) : (throwError("code should be unreachable"))))))),
        React.createElement(Grid, { size: 12 },
            React.createElement(StyledInfiniteScroll, { className: combineClassNames([wrapperClass, classes?.scroller]), loadMoreTop: loadMoreTop, loadMoreBottom: loadMoreBottom, ref: scrollElem },
                React.createElement(Box, { m: 2 },
                    React.createElement(Grid, { container: true, spacing: 2 }, state.items))))));
};
export default React.memo(ScrollableSchedule);
