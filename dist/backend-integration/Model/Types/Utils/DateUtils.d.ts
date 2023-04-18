import { Moment } from "moment/moment";
/**
 * Sets the date to midnight UTC
 * @param date A date
 * @returns A date "without time"
 */
export declare const normalizeDate: (date: Date) => Date;
export declare const normalizeMoment: (instance: Moment) => Moment;
