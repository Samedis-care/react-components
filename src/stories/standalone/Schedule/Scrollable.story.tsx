import React from "react";
import { makeStyles } from "@material-ui/core";
import ScrollableSchedule from "../../../standalone/Schedule/Scrollable";
import { getWeekData } from "./dataGen";
import { withActions } from "@storybook/addon-actions";
import { withKnobs } from "@storybook/addon-knobs";

const useStyles = makeStyles(() => ({
	scrollWrapper: {
		height: "50vh",
		width: "100%",
	},
}));

export const ScheduleScrollable = (): React.ReactElement => {
	const classes = useStyles();
	return (
		<ScrollableSchedule
			wrapperClass={classes.scrollWrapper}
			loadWeekCallback={getWeekData}
		/>
	);
};

ScheduleScrollable.storyName = "Scrollable";
ScheduleScrollable.decorators = [withActions, withKnobs];
