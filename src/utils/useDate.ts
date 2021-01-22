import { useEffect, useState } from "react";

const MS_PER_DAY = 86400000; // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
const MS_PER_MIN = 60000; // 60 seconds * 1000 milliseconds

/**
 * React hook to provide the current date
 * @returns The current date (updates every day)
 */
export const useDate = (): Date => {
	const [date, setDate] = useState(() => new Date());

	useEffect(() => {
		const timezoneTimestamp =
			date.getTime() - date.getTimezoneOffset() * MS_PER_MIN;
		const msTillNextDay = MS_PER_DAY - (timezoneTimestamp % MS_PER_DAY);

		const timer = window.setTimeout(() => {
			setDate(new Date());
		}, msTillNextDay + 100 /* safety */);

		return () => window.clearTimeout(timer);
	}, [date]);

	return date;
};

/**
 * React hook to provide the current date, hour and minute
 * @returns The current date (updates every minute)
 */
export const useDateHM = (): Date => {
	const [date, setDate] = useState(() => new Date());

	useEffect(() => {
		const msTillNextMinute = MS_PER_MIN - (date.getTime() % MS_PER_MIN);

		const timer = window.setTimeout(() => {
			setDate(new Date());
		}, msTillNextMinute + 100 /* safety */);

		return () => window.clearTimeout(timer);
	}, [date]);

	return date;
};

/**
 * React hook to provide the current date, hour, minute and second
 * @returns The current date (UPDATES EVERY SECOND)
 */
export const useDateHMS = (): Date => {
	const [date, setDate] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => {
			setDate(new Date());
		}, 1000);

		return () => window.clearInterval(timer);
	}, []);

	return date;
};
