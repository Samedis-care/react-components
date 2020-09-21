import React from "react";
import { makeStyles } from "@material-ui/core";
import ScrollableSchedule from "../../../standalone/Schedule/Scrollable";
import { getWeekData } from "./dataGen";

const Settings = {
	title: "Standalone/Schedule",
	component: ScrollableSchedule,
};
export default Settings;

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

ScheduleScrollable.story = {
	name: "Scrollable",
};
