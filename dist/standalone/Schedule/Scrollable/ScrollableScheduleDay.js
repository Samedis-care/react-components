import React, { PureComponent } from "react";
import { Grid } from "@mui/material";
import DayContents from "../Common/DayContents";
class ScrollableScheduleDay extends PureComponent {
    render() {
        return (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true, xs: 1, ref: this.props.refFwd }, this.props.moment.format("DD ddd")),
            React.createElement(Grid, { item: true, xs: 11 },
                React.createElement(DayContents, { data: this.props.data }))));
    }
}
export default ScrollableScheduleDay;
