import { MatrixColumn } from "./types";
export interface BuildDateColumnsParams {
    /**
     * First day of the range (ISO date, YYYY-MM-DD)
     */
    from: string;
    /**
     * Last day of the range, inclusive (ISO date, YYYY-MM-DD)
     */
    to: string;
    /**
     * Locale for the weekday names
     * @default the browser's locale
     * @remarks Inside a component use useCurrentLocale() to pass the locale the
     * rest of the app uses.
     */
    locale?: string;
    /**
     * Which day counts as today and gets the "current" variant. Pass null to
     * mark no day at all. Anything moment can parse; it is normalized to a
     * date, so a timestamp works too.
     * @default the actual current day
     */
    today?: string | null;
    /**
     * Day(s) to mark with the "accent" variant. Wins over "current". Normalized
     * like today.
     */
    accent?: string | string[];
    /**
     * Weekdays that get the "muted" variant, as moment day indexes (0 = Sunday)
     * @default [0, 6] (the weekend)
     */
    mutedWeekdays?: number[];
    /**
     * Hard cap on the number of columns, so a bad range cannot lock up the
     * browser
     * @default 400
     */
    maxColumns?: number;
}
/**
 * Builds the columns of a day-per-column matrix.
 * @param params The range, and how to mark the days in it
 * @returns One column per day, keyed by ISO date, labeled with the day number
 * and the localized short weekday
 * @remarks The weekday names come from Intl, not from moment, so a consumer
 * does not have to bundle moment's locale files to get localized headers.
 */
declare const buildDateColumns: (params: BuildDateColumnsParams) => MatrixColumn[];
export default buildDateColumns;
