import React from "react";
import Weekly from "../../../standalone/Schedule/Weekly";
import "../../../i18n";
import { getWeekData } from "./dataGen";

const Settings = {
	title: "Standalone/Schedule",
	component: Weekly,
};
export default Settings;

export const ScheduleWeekly = () => {
	return <Weekly loadData={getWeekData} />;
};

ScheduleWeekly.story = {
	name: "Weekly",
};
