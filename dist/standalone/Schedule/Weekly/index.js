import React, { useCallback, useEffect, useState } from "react";
import WeekViewDay from "./WeekViewDay";
import moment from "moment";
import { Box, CircularProgress, Divider, IconButton, Menu, } from "@mui/material";
import { Button, Typography, Grid } from "@mui/material";
import { ArrowForwardIos, ArrowBackIos, Settings as SettingsIcon, } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ToDateLocaleStringOptions } from "../../../constants";
import useCCTranslations from "../../../utils/useCCTranslations";
import makeStyles from "@mui/styles/makeStyles";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import ScheduleFilterRenderer from "../Common/ScheduleFilterRenderers";
const normalizeMoment = (instance) => instance.weekday(0).hour(0).minute(0).second(0).millisecond(0);
const nowNormalized = () => normalizeMoment(moment());
const useStyles = makeStyles({
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
const EMPTY_FILTERS = {};
const NO_ACTIONS = [];
const WeekView = (props) => {
    const { loadData } = props;
    const filters = props.filters ?? EMPTY_FILTERS;
    const actions = props.actions ?? NO_ACTIONS;
    const filterCount = Object.keys(filters).length;
    const classes = useStyles();
    const { t, i18n } = useCCTranslations();
    /**
     * The offset to the current week
     * Example: -1 for last week, 0 for this week, 1 for next week
     */
    const [weekOffset, setWeekOffset] = useState(0);
    /**
     * The day contents data for this week
     * Format: IDayData[weekday starting Monday][n]
     */
    const [data, setData] = useState(null);
    /**
     * The data load error that occurred (if any)
     */
    const [loadError, setLoadError] = useState(null);
    /**
     * If the date picker is open
     */
    const [datePickerAnchorEl, setDatePickerAnchorEl] = useState(null);
    /**
     * The current filter value
     */
    const [filterValues, setFilterValues] = useState(() => Object.fromEntries(Object.entries(filters).map(([name, filter]) => [
        name,
        filter.defaultValue,
    ])));
    const prevWeek = useCallback(() => {
        setWeekOffset((prev) => prev - 1);
    }, []);
    const nextWeek = useCallback(() => {
        setWeekOffset((prev) => prev + 1);
    }, []);
    const handleFilterChange = useCallback((evt) => {
        const value = evt.target.type === "checkbox"
            ? evt.target.checked
            : evt.target.value;
        setFilterValues((prev) => ({
            ...prev,
            [evt.target.name]: value,
        }));
        if (!props.filters)
            return;
        const changeHandler = props.filters[evt.target.name].onChange;
        if (changeHandler)
            changeHandler(value);
    }, [props.filters]);
    const [filterSettingsAnchorEl, setFilterSettingsAnchorEl] = useState(null);
    const openFilterSettings = useCallback((evt) => {
        setFilterSettingsAnchorEl(evt.currentTarget);
    }, []);
    const closeFiltersMenu = useCallback(() => {
        setFilterSettingsAnchorEl(null);
    }, []);
    const today = useCallback(() => {
        setWeekOffset(0);
    }, []);
    const setWeek = useCallback((date) => {
        if (!date)
            return;
        const start = nowNormalized();
        const end = normalizeMoment(date);
        const week = end.diff(start, "week");
        setWeekOffset(week);
        setDatePickerAnchorEl(null);
    }, []);
    const openDatePicker = useCallback((evt) => {
        setDatePickerAnchorEl(evt.currentTarget);
    }, []);
    const closeDatePicker = useCallback(() => {
        setDatePickerAnchorEl(null);
    }, []);
    useEffect(() => {
        const langChangeHandler = () => {
            setData(null);
            setLoadError(null);
        };
        i18n.on("languageChanged", langChangeHandler);
        return () => {
            i18n.off("languageChanged", langChangeHandler);
        };
    }, [i18n]);
    useEffect(() => {
        setData(null);
        setLoadError(null);
        // fetch data
        void (async () => {
            try {
                const data = await loadData(weekOffset, filterValues);
                setData(data);
            }
            catch (loadError) {
                setLoadError(loadError);
            }
        })();
    }, [filterValues, loadData, weekOffset]);
    const now = moment();
    const weekday = now.weekday();
    const weekdays = [0, 1, 2, 3, 4, 5, 6].map((day) => day - weekday);
    let prevDate = null;
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
                    React.createElement(Grid, { item: true }, filterCount > 0 && (React.createElement(Box, { px: 2, className: classes.filterWrapper }, (() => {
                        const [name, filter] = Object.entries(filters)[0];
                        return (React.createElement(ScheduleFilterRenderer, { ...filter, name: name, value: filterValues[name], onChange: handleFilterChange, inline: "weekly" }));
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
            React.createElement(Grid, { item: true, xs: true, container: true, justifyContent: "flex-end" }, (filterCount > 1 || actions.length > 0) && (React.createElement(Grid, { item: true },
                React.createElement(Box, { px: 2, className: classes.filterWrapper }, filterCount > 2 || actions.length > 1 ? (React.createElement(React.Fragment, null,
                    React.createElement(IconButton, { onClick: openFilterSettings },
                        React.createElement(SettingsIcon, null)),
                    React.createElement(Menu, { open: filterSettingsAnchorEl != null, anchorEl: filterSettingsAnchorEl, onClose: closeFiltersMenu },
                        React.createElement(Box, { p: 1 },
                            React.createElement(Grid, { container: true, spacing: 1 },
                                Object.entries(filters).map(([name, filter], idx) => idx !== 0 && (React.createElement(Grid, { key: "filter-" + name, item: true, xs: 12 },
                                    React.createElement(ScheduleFilterRenderer, { ...filter, name: name, value: filter.type === "select"
                                            ? filterValues[name]
                                            : filterValues[name], onChange: handleFilterChange })))),
                                filterCount > 2 && (React.createElement(Grid, { item: true, key: "divider", xs: 12 },
                                    React.createElement(Divider, null))),
                                actions.length > 1 &&
                                    actions.map((action, idx) => idx !== 0 && (React.createElement(Grid, { item: true, key: "action-" + action.id, xs: 12 },
                                        React.createElement(Button, { onClick: action.onClick, disabled: action.disabled, fullWidth: true }, action.label))))))))) : (React.createElement(Grid, { container: true, spacing: 2, wrap: "nowrap", alignItems: "center" }, (() => {
                    const ret = [];
                    if (actions.length > 0) {
                        const action = actions[0];
                        ret.push(React.createElement(Grid, { item: true, key: "action-" + action.id },
                            React.createElement(Button, { onClick: action.onClick, disabled: action.disabled }, action.label)));
                    }
                    if (filterCount > 1) {
                        const [name, filter] = Object.entries(filters)[1];
                        ret.push(React.createElement(Grid, { item: true, key: "filter-" + name },
                            React.createElement(ScheduleFilterRenderer, { ...filter, name: name, value: filterValues[name], onChange: handleFilterChange, inline: "weekly" })));
                    }
                    return ret;
                })()))))))),
        loadError && (React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Typography, { align: "center" }, loadError.message))),
        !data && !loadError && (React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Grid, { container: true, justifyContent: "space-around" },
                React.createElement(CircularProgress, null)))),
        data && (React.createElement(Grid, { item: true, xs: 12, container: true, alignItems: "stretch", alignContent: "space-between", wrap: "nowrap" }, weekdays.map((day, dayIdx) => {
            const date = now.clone().add(weekOffset, "weeks").add(day, "days");
            const diffDay = !prevDate || prevDate.day() !== date.day();
            const diffMonth = !prevDate || prevDate.month() !== date.month();
            const diffYear = prevDate && prevDate.year() !== date.year();
            prevDate = date;
            let formattedDate = "";
            if (diffYear)
                formattedDate += `${date.year()} `;
            if (diffMonth)
                formattedDate += `${date.format("MMMM")} `;
            if (diffDay)
                formattedDate += date.format("DD");
            const dayData = data[(date.weekday() + date.localeData().firstDayOfWeek()) % 7];
            return (React.createElement(WeekViewDay, { key: day, dayIdx: dayIdx, day: date, date: formattedDate, data: dayData }));
        })))));
};
export default React.memo(WeekView);