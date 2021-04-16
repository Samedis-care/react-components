import React from "react";
import { makeStyles } from "@material-ui/core";
import ScrollableSchedule from "../../../standalone/Schedule/Scrollable";
import { getWeekData } from "./dataGen";

const useStyles = makeStyles(
	{
		scrollWrapper: {
			height: "50vh",
			width: "100%",
		},
	},
	{ name: "CcScrollableStory" }
);

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
