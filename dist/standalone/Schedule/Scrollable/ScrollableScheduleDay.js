import React from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import DayContents from "../Common/DayContents";
const Root = styled(Grid, {
    name: "CcScrollableScheduleDay",
    slot: "root",
})({});
const ScrollableScheduleDay = React.forwardRef(function ScrollableScheduleDay(inProps, ref) {
    const props = useThemeProps({
        props: inProps,
        name: "CcScrollableScheduleDay",
    });
    return (React.createElement(Root, { item: true, xs: 12, container: true, spacing: 2, className: props.today ? "CcScrollableScheduleDay-today" : undefined },
        React.createElement(Grid, { item: true, xs: 1, ref: ref }, props.moment.format("DD ddd")),
        React.createElement(Grid, { item: true, xs: 11 },
            React.createElement(DayContents, { data: props.data }))));
});
export default React.memo(ScrollableScheduleDay);
