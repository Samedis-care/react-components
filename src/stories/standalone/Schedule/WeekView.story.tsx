import React from "react";
import Weekly from "../../../standalone/Schedule/Weekly";
import "../../../i18n";
import { getWeekData } from "./dataGen";

export const ScheduleWeekly = (): React.ReactElement => {
	return <Weekly loadData={getWeekData} />;
};

ScheduleWeekly.storyName = "Weekly";
