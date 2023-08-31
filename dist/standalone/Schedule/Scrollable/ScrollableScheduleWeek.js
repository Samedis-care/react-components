import React, { PureComponent } from "react";
import { CircularProgress, Divider, Grid } from "@mui/material";
import ScrollableScheduleDay from "./ScrollableScheduleDay";
import moment from "moment";
import useCCTranslations from "../../../utils/useCCTranslations";
class ScrollableScheduleWeek extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            loadError: null,
        };
    }
    async componentDidMount() {
        try {
            const data = await this.props.loadData();
            this.setState({
                data,
            });
        }
        catch (e) {
            this.setState({
                loadError: e,
            });
        }
    }
    render() {
        if (this.state.loadError) {
            return (React.createElement(Grid, { item: true, xs: 12 }, this.state.loadError.message));
        }
        if (!this.state.data) {
            return (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Grid, { container: true, justifyContent: "space-around" },
                    React.createElement(CircularProgress, null))));
        }
        const firstDay = this.props.moment;
        firstDay.subtract(firstDay.weekday(), "days");
        const dayItems = [];
        const now = moment();
        for (let day = 0; day < 7; ++day) {
            const dayMoment = firstDay.clone().add(day, "days");
            if (dayMoment.dayOfYear() === now.dayOfYear() &&
                dayMoment.year() === now.year()) {
                dayItems.push(React.createElement(ScrollableScheduleDay, { key: day, data: this.state.data[day], refFwd: this.props.setTodayElement, moment: dayMoment }));
            }
            else {
                dayItems.push(React.createElement(ScrollableScheduleDay, { key: `${day}`, data: this.state.data[day], moment: dayMoment }));
            }
        }
        const endOfWeek = firstDay.clone().add(6, "days");
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
    }
}
const ScrollableScheduleWeekWithTranslation = (props) => {
    const { i18n, t, ready: tReady } = useCCTranslations();
    return (React.createElement(ScrollableScheduleWeek, { ...props, i18n: i18n, t: t, tReady: tReady }));
};
export default ScrollableScheduleWeekWithTranslation;
