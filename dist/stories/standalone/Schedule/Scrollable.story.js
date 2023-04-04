import React from "react";
import { makeStyles } from "@material-ui/core";
import ScrollableSchedule from "../../../standalone/Schedule/Scrollable";
import { getWeekData } from "./dataGen";
var useStyles = makeStyles({
    scrollWrapper: {
        height: "50vh",
        width: "100%",
    },
}, { name: "CcScrollableStory" });
export var ScheduleScrollable = function () {
    var classes = useStyles();
    return (React.createElement(ScrollableSchedule, { wrapperClass: classes.scrollWrapper, loadWeekCallback: getWeekData }));
};
ScheduleScrollable.storyName = "Scrollable";
