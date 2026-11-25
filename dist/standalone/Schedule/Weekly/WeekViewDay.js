import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DayContents from "../Common/DayContents";
import { styled, useThemeProps } from "@mui/material";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import moment from "moment";
import combineClassNames from "../../../utils/combineClassNames";
/** thickness of the bar on the top edge of today's column, in px */
const TODAY_BAR_THICKNESS = 4;
const StyledPaper = styled(Paper, { name: "CcWeekViewDay", slot: "paper" })(({ theme }) => ({
    height: "100%",
    "&.CcWeekViewDay-today": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        // not a color only, so the mark stays in forced-colors mode, which
        // replaces the background: bold labels and a bar on the top edge.
        // The bar is a border (forced colors keep borders) on an overlay, so
        // the column's labels stay in line with the other columns' labels.
        position: "relative",
        fontWeight: theme.typography.fontWeightBold,
        "& .CcWeekViewDay-weekday": {
            fontWeight: "inherit",
        },
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            borderTop: `${TODAY_BAR_THICKNESS}px solid ${theme.palette.primary.main}`,
            pointerEvents: "none",
        },
    },
    "&.CcWeekViewDay-first": {
        borderRadius: `0 0 0 ${theme.shape.borderRadius}px`,
    },
    "&.CcWeekViewDay-last": {
        borderRadius: `0 0 ${theme.shape.borderRadius}px 0`,
    },
}));
const DayContentsWrapper = styled(Grid, {
    name: "CcWeekViewDay",
    slot: "dayContents",
})({
    minHeight: 150,
});
const WeekViewDay = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcWeekViewDay" });
    const { dayIdx, day, date, data, className, classes } = props;
    const isFirst = dayIdx === 0;
    const isLast = dayIdx === 6;
    const isToday = day.dayOfYear() === moment().dayOfYear() && day.year() === moment().year();
    return (_jsx(Grid, { className: className, size: "grow", children: _jsx(StyledPaper, { square: true, elevation: 0, className: combineClassNames([
                classes?.paper,
                isToday && "CcWeekViewDay-today",
                isFirst && "CcWeekViewDay-first",
                isLast && "CcWeekViewDay-last",
            ]), "aria-current": isToday ? "date" : undefined, children: _jsxs(Grid, { container: true, children: [_jsx(Grid, { size: 12, children: _jsx(Typography, { align: "center", className: "CcWeekViewDay-weekday", children: day.format("dddd") }) }), _jsx(Grid, { size: 12, children: _jsx(Divider, {}) }), _jsx(Grid, { size: 12, children: _jsx(Box, { sx: { m: 1 }, children: date }) }), _jsx(DayContentsWrapper, { size: 12, className: classes?.dayContents, children: _jsx(Box, { sx: { m: 1 }, children: _jsx(DayContents, { data: data, altBorder: isToday }) }) })] }) }) }));
};
export default React.memo(WeekViewDay);
