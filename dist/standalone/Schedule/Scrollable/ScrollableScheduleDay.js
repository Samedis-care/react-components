import React from "react";
import { Grid2 as Grid, styled, useThemeProps } from "@mui/material";
import DayContents from "../Common/DayContents";
const Root = styled("div", {
    name: "CcScrollableScheduleDay",
    slot: "root",
})(({ theme }) => ({
    margin: theme.spacing(0, -2),
    paddingLeft: theme.spacing(1),
}));
const ScrollableScheduleDay = React.forwardRef(function ScrollableScheduleDay(inProps, ref) {
    const props = useThemeProps({
        props: inProps,
        name: "CcScrollableScheduleDay",
    });
    return (React.createElement(Grid, { size: 12 },
        React.createElement(Root, { className: props.today ? "CcScrollableScheduleDay-today" : undefined },
            React.createElement(Grid, { container: true, spacing: 2 },
                React.createElement(Grid, { ref: ref, size: 1 }, props.moment.format("DD ddd")),
                React.createElement(Grid, { size: 11 },
                    React.createElement(DayContents, { data: props.data }))))));
});
export default React.memo(ScrollableScheduleDay);
