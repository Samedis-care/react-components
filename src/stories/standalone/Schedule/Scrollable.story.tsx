import React from "react";
import { makeStyles } from "@material-ui/core";
import ScrollableSchedule from "../../../standalone/Schedule/Scrollable";
import "../../../i18n";
import { IDayData } from "../../../standalone/Schedule/Common/DayContents";

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
			loadWeekCallback={async (weekOffset: number): Promise<IDayData[][]> => {
				const weekContents: IDayData[][] = [];
				for (let weekday = 0; weekday < 7; ++weekday) {
					const entryCount = (Math.random() * 10) | 0;
					const dayContents: IDayData[] = [];

					for (let i = 0; i < entryCount; ++i) {
						dayContents.push({
							id: `${weekOffset}-${weekday}-${i}`,
							title: Math.random().toString(),
						});
					}

					weekContents.push(dayContents);
				}
				return weekContents;
			}}
		/>
	);
};

ScheduleScrollable.story = {
	name: "Scrollable",
};
