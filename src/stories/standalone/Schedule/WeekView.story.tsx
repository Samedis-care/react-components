import React from "react";
import Weekly from "../../../standalone/Schedule/Weekly";
import "../../../i18n";
import { IDayData } from "../../../standalone/Schedule/Common/DayContents";

export default {
	title: "Standalone/Schedule",
	component: Weekly,
};

export const ScheduleWeekly = () => {
	return (
		<Weekly
			loadData={async (weekOffset: number): Promise<IDayData[][]> => {
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

ScheduleWeekly.story = {
	name: "Weekly",
};
