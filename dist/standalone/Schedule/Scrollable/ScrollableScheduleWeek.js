import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { PureComponent, useId } from "react";
import { Alert, AlertTitle, Button, CircularProgress, Divider, Grid, styled, } from "@mui/material";
import ScrollableScheduleDay from "./ScrollableScheduleDay";
import moment from "moment";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../../../utils/internal/focusRing";
// MUI's own keyboard focus is a tint, which forced colors drop
const RetryButton = styled(Button)(({ theme }) => ({
    "&.Mui-focusVisible": focusRing(theme, 2),
}));
/**
 * One week of ScrollableSchedule: a spinner while it loads, then a "Week N,
 * DD MMM - DD MMM" line and its day rows. When the load fails, the week line
 * stays and an alert names the week and shows the error's message, with a
 * Retry button that loads the week again.
 */
class ScrollableScheduleWeek extends PureComponent {
    /**
     * Counts the loads started; a result is applied only if no other load
     * started after it and the week is still mounted
     */
    loadId = 0;
    /**
     * The week line; it stays in place from the failed week to the retry and
     * the loaded week, so it takes the focus from the Retry button
     */
    weekLine = React.createRef();
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            loadError: null,
            retrying: false,
        };
    }
    componentDidMount() {
        this.load();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.loadWeekCallback !== this.props.loadWeekCallback ||
            prevProps.weekOffset !== this.props.weekOffset ||
            prevProps.filterValues !== this.props.filterValues) {
            this.load();
        }
    }
    componentWillUnmount() {
        ++this.loadId;
    }
    load() {
        const loadId = ++this.loadId;
        const { loadWeekCallback, weekOffset, filterValues } = this.props;
        void (async () => {
            try {
                const data = await loadWeekCallback(weekOffset, filterValues);
                if (loadId !== this.loadId)
                    return;
                this.setState({
                    data,
                    loadError: null,
                    retrying: false,
                });
            }
            catch (e) {
                if (loadId !== this.loadId)
                    return;
                this.setState({
                    data: null,
                    loadError: e,
                    retrying: false,
                });
            }
        })();
    }
    /**
     * Loads the failed week again. The Retry button goes away with the error,
     * so the focus moves to the week line, which stays.
     */
    retry = () => {
        this.weekLine.current?.focus();
        this.setState({ retrying: true });
        this.load();
    };
    /**
     * The spinner of a pending load: the whole week while it first loads, below
     * the week line while a retry is pending
     */
    renderProgress() {
        return (_jsx(Grid, { size: 12, children: _jsx(Grid, { container: true, sx: { justifyContent: "space-around" }, children: _jsx(CircularProgress, {}) }) }));
    }
    render() {
        const { data, loadError, retrying } = this.state;
        const { t, idPrefix } = this.props;
        if (!data && !loadError) {
            return this.renderProgress();
        }
        const firstDay = this.props.today
            .clone()
            .add(this.props.weekOffset, "weeks");
        firstDay.subtract(firstDay.weekday(), "days");
        const dayItems = [];
        const now = moment();
        for (let day = 0; data && day < 7; ++day) {
            const dayMoment = firstDay.clone().add(day, "days");
            if (dayMoment.dayOfYear() === now.dayOfYear() &&
                dayMoment.year() === now.year()) {
                dayItems.push(_jsx(ScrollableScheduleDay, { data: data[day], ref: this.props.setTodayElement, moment: dayMoment, today: true }, day));
            }
            else {
                dayItems.push(_jsx(ScrollableScheduleDay, { data: data[day], moment: dayMoment }, `${day}`));
            }
        }
        const errorId = `${idPrefix}-error`;
        const endOfWeek = firstDay.clone().add(6, "days");
        return (_jsxs(_Fragment, { children: [_jsx(Grid, { size: 12, children: _jsx(Divider, {}) }), _jsx(Grid, { size: 1 }), _jsxs(Grid, { size: 11, ref: this.weekLine, tabIndex: -1, children: [t("standalone.schedule.week"), " ", firstDay.week(), ",", " ", firstDay.format("DD MMM"), " - ", endOfWeek.format("DD MMM")] }), data ? (dayItems) : retrying ? (this.renderProgress()) : (_jsx(Grid, { size: 11, offset: 1, children: _jsxs(Alert, { severity: "error", slotProps: { message: { id: errorId } }, action: _jsx(RetryButton, { color: "inherit", size: "small", onClick: this.retry, "aria-describedby": errorId, children: t("standalone.schedule.retry") }), children: [_jsx(AlertTitle, { children: t("standalone.schedule.week-load-error", {
                                    WEEK: firstDay.week(),
                                }) }), loadError?.message] }) }))] }));
    }
}
const ScrollableScheduleWeekWithTranslation = (props) => {
    const { i18n, t, ready: tReady } = useCCTranslations();
    const idPrefix = useId();
    return (_jsx(ScrollableScheduleWeek, { ...props, idPrefix: idPrefix, i18n: i18n, t: t, tReady: tReady }));
};
export default ScrollableScheduleWeekWithTranslation;
