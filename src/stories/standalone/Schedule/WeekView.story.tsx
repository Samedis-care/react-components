import React from "react";
import Weekly from "../../../standalone/Schedule/Weekly";
import "../../../i18n";
import { getWeekData } from "./dataGen";

export default {
	title: "Standalone/Schedule",
	component: Weekly,
};

export const ScheduleWeekly = () => {
	return <Weekly loadData={getWeekData} />;
};

ScheduleWeekly.story = {
	name: "Weekly",
};
