import React from "react";
import Weekly from "../../../standalone/Schedule/Weekly";
import "../../../i18n";
import { getWeekData } from "./dataGen";
import { withActions } from "@storybook/addon-actions";
import { withKnobs } from "@storybook/addon-knobs";

export const ScheduleWeekly = (): React.ReactElement => {
	return <Weekly loadData={getWeekData} />;
};

ScheduleWeekly.storyName = "Weekly";
ScheduleWeekly.decorators = [withActions, withKnobs];
