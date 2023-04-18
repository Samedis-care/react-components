import { Moment } from "moment/moment";

/**
 * Sets the date to midnight UTC
 * @param date A date
 * @returns A date "without time"
 */
export const normalizeDate = (date: Date): Date => {
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

export const normalizeMoment = (instance: Moment) =>
	instance.weekday(0).hour(0).minute(0).second(0).millisecond(0);
