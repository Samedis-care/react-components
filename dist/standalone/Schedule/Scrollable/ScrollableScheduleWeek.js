import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PureComponent } from "react";
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
    componentDidMount() {
        void (async () => {
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
        })();
    }
    render() {
        if (this.state.loadError) {
            return _jsx(Grid, { size: 12, children: this.state.loadError.message });
        }
        if (!this.state.data) {
            return (_jsx(Grid, { size: 12, children: _jsx(Grid, { container: true, sx: { justifyContent: "space-around" }, children: _jsx(CircularProgress, {}) }) }));
        }
        const firstDay = this.props.moment;
        firstDay.subtract(firstDay.weekday(), "days");
        const dayItems = [];
        const now = moment();
        for (let day = 0; day < 7; ++day) {
            const dayMoment = firstDay.clone().add(day, "days");
            if (dayMoment.dayOfYear() === now.dayOfYear() &&
                dayMoment.year() === now.year()) {
                dayItems.push(_jsx(ScrollableScheduleDay, { data: this.state.data[day], ref: this.props.setTodayElement, moment: dayMoment, today: true }, day));
            }
            else {
                dayItems.push(_jsx(ScrollableScheduleDay, { data: this.state.data[day], moment: dayMoment }, `${day}`));
            }
        }
        const endOfWeek = firstDay.clone().add(6, "days");
        return (_jsxs(_Fragment, { children: [_jsx(Grid, { size: 12, children: _jsx(Divider, {}) }), _jsx(Grid, { size: 1 }), _jsxs(Grid, { size: 11, children: [this.props.t("standalone.schedule.week"), " ", firstDay.week(), ",", " ", firstDay.format("DD MMM"), " - ", endOfWeek.format("DD MMM")] }), dayItems] }));
    }
}
const ScrollableScheduleWeekWithTranslation = (props) => {
    const { i18n, t, ready: tReady } = useCCTranslations();
    return (_jsx(ScrollableScheduleWeek, { ...props, i18n: i18n, t: t, tReady: tReady }));
};
export default ScrollableScheduleWeekWithTranslation;
