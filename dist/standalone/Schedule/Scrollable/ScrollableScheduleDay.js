import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import DayContents from "../Common/DayContents";
/** width of the bar that marks today's row, in px */
const TODAY_BAR_WIDTH = 4;
const Root = styled("div", {
    name: "CcScrollableScheduleDay",
    slot: "root",
})(({ theme }) => ({
    margin: theme.spacing(0, -2),
    paddingLeft: theme.spacing(1),
    "&.CcScrollableScheduleDay-today": {
        // a border, not only a color, so the mark stays in forced-colors mode;
        // the padding shrinks by its width, so the label stays in line
        borderLeft: `${TODAY_BAR_WIDTH}px solid ${theme.palette.primary.main}`,
        paddingLeft: `calc(${theme.spacing(1)} - ${TODAY_BAR_WIDTH}px)`,
        fontWeight: theme.typography.fontWeightBold,
    },
}));
const ScrollableScheduleDay = React.forwardRef(function ScrollableScheduleDay(inProps, ref) {
    const props = useThemeProps({
        props: inProps,
        name: "CcScrollableScheduleDay",
    });
    return (_jsx(Grid, { size: 12, children: _jsx(Root, { className: props.today ? "CcScrollableScheduleDay-today" : undefined, "aria-current": props.today ? "date" : undefined, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { ref: ref, size: 1, children: props.moment.format("DD ddd") }), _jsx(Grid, { size: 11, children: _jsx(DayContents, { data: props.data }) })] }) }) }));
});
export default React.memo(ScrollableScheduleDay);
