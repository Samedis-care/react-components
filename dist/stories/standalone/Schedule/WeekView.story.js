import React from "react";
import Weekly from "../../../standalone/Schedule/Weekly";
import "../../../i18n";
import { getWeekData } from "./dataGen";
export var ScheduleWeekly = function () {
    return React.createElement(Weekly, { loadData: getWeekData });
};
ScheduleWeekly.storyName = "Weekly";
