import React from "react";
import { makeStyles } from "@material-ui/core";
import ScrollableSchedule from "../../../standalone/Schedule/Scrollable";
import { getWeekData } from "./dataGen";

export default {
	title: "Standalone/Schedule",
	component: ScrollableSchedule,
};

const useStyles = makeStyles(() => ({
	scrollWrapper: {
		height: "50vh",
		width: "100%",
	},
}));

export const ScheduleScrollable = () => {
	const classes = useStyles();
	return (
		<ScrollableSchedule
			wrapperClass={classes.scrollWrapper}
			loadWeekCallback={getWeekData}
		/>
	);
};

ScheduleScrollable.story = {
	name: "Scrollable",
};
