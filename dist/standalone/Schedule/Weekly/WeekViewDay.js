import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DayContents from "../Common/DayContents";
import { makeStyles } from "@mui/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import moment from "moment";
import { combineClassNames } from "../../../utils";
var useStyles = makeStyles(function (theme) { return ({
    paper: {
        height: "100%",
    },
    today: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    first: {
        borderRadius: "".concat(theme.shape.borderRadius, "px 0 0 ").concat(theme.shape.borderRadius, "px"),
    },
    last: {
        borderRadius: "0 ".concat(theme.shape.borderRadius, "px ").concat(theme.shape.borderRadius, "px 0"),
    },
    dayContents: {
        minHeight: 150,
    },
}); }, { name: "CcWeekViewDay" });
var WeekViewDay = function (props) {
    var classes = useStyles();
    var isFirst = props.dayIdx === 0;
    var isLast = props.dayIdx === 6;
    var isToday = props.day.dayOfYear() === moment().dayOfYear() &&
        props.day.year() === moment().year();
    return (React.createElement(Grid, { item: true, xs: true },
        React.createElement(Paper, { square: true, elevation: 0, className: combineClassNames([
                isToday && classes.today,
                classes.paper,
                isFirst && classes.first,
                isLast && classes.last,
            ]) },
            React.createElement(Grid, { container: true },
                React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement(Typography, { align: "center" }, props.day.format("dddd"))),
                React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement(Divider, null)),
                React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement(Box, { m: 1 }, props.date)),
                React.createElement(Grid, { item: true, xs: 12, className: classes.dayContents },
                    React.createElement(Box, { m: 1 },
                        React.createElement(DayContents, { data: props.data })))))));
};
export default React.memo(WeekViewDay);
