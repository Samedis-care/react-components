import { IDayData as Data } from "../../../standalone/Schedule/Common/DayContents";

export const getWeekData = async (weekOffset: number): Promise<Data[][]> => {
	const weekContents: Data[][] = [];
	for (let weekday = 0; weekday < 7; ++weekday) {
		const entryCount = (Math.random() * 10) | 0;
		const dayContents: Data[] = [];

		for (let i = 0; i < entryCount; ++i) {
			dayContents.push({
				id: `${weekOffset}-${weekday}-${i}`,
				title: Math.random().toString(),
			});
		}

		weekContents.push(dayContents);
	}
	return weekContents;
};
