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
const StyledPaper = styled(Paper, { name: "CcWeekViewDay", slot: "paper" })(({ theme }) => ({
    height: "100%",
    ".CcWeekViewDay-today": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    ".CcWeekViewDay-first": {
        borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
    },
    ".CcWeekViewDay-last": {
        borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
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
    return (React.createElement(Grid, { item: true, xs: true, className: className },
        React.createElement(StyledPaper, { square: true, elevation: 0, className: combineClassNames([
                classes?.paper,
                isToday && "CcWeekViewDay-today",
                isFirst && "CcWeekViewDay-first",
                isLast && "CcWeekViewDay-last",
            ]) },
            React.createElement(Grid, { container: true },
                React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement(Typography, { align: "center" }, day.format("dddd"))),
                React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement(Divider, null)),
                React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement(Box, { m: 1 }, date)),
                React.createElement(DayContentsWrapper, { item: true, xs: 12, className: classes?.dayContents },
                    React.createElement(Box, { m: 1 },
                        React.createElement(DayContents, { data: data, altBorder: isToday })))))));
};
export default React.memo(WeekViewDay);
