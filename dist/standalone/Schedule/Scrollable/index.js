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
const useStyles = makeStyles((theme) => ({
    today: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
        borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    },
    todayBtn: {
        textTransform: "none",
        textAlign: "left",
        color: "inherit",
        display: "block",
    },
    scroller: {
        overflow: "auto",
        borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
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
}), { name: "CcScrollableSchedule" });
const preventAction = (evt) => {
    evt.stopPropagation();
};
const EMPTY_FILTERS = {};
const ScrollableSchedule = (props) => {
    const { loadWeekCallback, wrapperClass } = props;
    const filters = props.filters ?? EMPTY_FILTERS;
    const { i18n } = useCCTranslations();
    const classes = useStyles();
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
            return (React.createElement(ScrollableScheduleWeek, { key: page.toString(), loadData: () => loadWeekCallback(page, state.filterValues), setTodayElement: (elem) => (todayElem.current = elem), moment: state.today.clone().add(page - 1, "weeks") }));
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
    const [filterSettingsAnchorEl, setFilterSettingsAnchorEl,] = useState(null);
    const openFilterSettings = useCallback((evt) => {
        setFilterSettingsAnchorEl(evt.currentTarget);
    }, []);
    const closeFiltersMenu = useCallback(() => {
        setFilterSettingsAnchorEl(null);
    }, []);
    const filterCount = filters ? Object.keys(filters).length : 0;
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
                            React.createElement(Grid, { container: true, spacing: 1 }, Object.entries(filters).map(([name, filter]) => (React.createElement(Grid, { key: name, item: true, xs: 12 },
                                React.createElement(ScrollableFilterRenderer, { ...filter, name: name, value: filter.type === "select"
                                        ? state.filterValues[name]
                                        : state.filterValues[name], onChange: handleFilterChange }))))))))) : ((() => {
                    const [name, filter] = Object.entries(filters)[0];
                    return (React.createElement(ScrollableFilterRenderer, { ...filter, name: name, value: state.filterValues[name], onChange: handleFilterChange, inline: "scrollable" }));
                })())))))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(InfiniteScroll, { className: combineClassNames([wrapperClass, classes.scroller]), loadMoreTop: loadMoreTop, loadMoreBottom: loadMoreBottom, ref: scrollElem },
                React.createElement(Box, { m: 2 },
                    React.createElement(Grid, { container: true, spacing: 2 }, state.items))))));
};
export default React.memo(ScrollableSchedule);
