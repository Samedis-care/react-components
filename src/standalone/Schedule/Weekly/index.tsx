import React, { useCallback, useEffect, useState } from "react";
import WeekViewDay from "./WeekViewDay";
import moment, { Moment } from "moment";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { Button, Typography, Grid } from "@mui/material";
import { IDayData, ScheduleFilterDefinition } from "../Common/DayContents";
import { ArrowForwardIos, ArrowBackIos } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ToDateLocaleStringOptions } from "../../../constants";
import useCCTranslations from "../../../utils/useCCTranslations";
import makeStyles from "@mui/styles/makeStyles";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { normalizeMoment } from "../../../backend-integration/Model/Types/Utils/DateUtils";

export interface WeekViewProps {
	/**
	 * Callback to load data of this week
	 * @param weekOffset The offset to the current week
	 * @param filter The selected filter
	 */
	loadData: (
		weekOffset: number,
		filter: string | null
	) => IDayData[][] | Promise<IDayData[][]>;

	/**
	 * Optional filter
	 */
	filter?: ScheduleFilterDefinition;
}

const nowNormalized = () => normalizeMoment(moment());

const useStyles = makeStyles(
	{
		todayBtn: {
			height: "100%",
		},
		week: {
			cursor: "pointer",
		},
		picker: {
			display: "none",
		},
		filterWrapper: {
			top: "50%",
			position: "relative",
			transform: "translateY(-50%)",
		},
		filterSelect: {
			backgroundColor: "transparent",
			border: "none",
			cursor: "pointer",
		},
	},
	{ name: "CcWeekView" }
);

const WeekView = (props: WeekViewProps) => {
	const { loadData, filter } = props;
	const classes = useStyles();
	const { t, i18n } = useCCTranslations();
	/**
	 * The offset to the current week
	 * Example: -1 for last week, 0 for this week, 1 for next week
	 */
	const [weekOffset, setWeekOffset] = useState<number>(0);
	/**
	 * The day contents data for this week
	 * Format: IDayData[weekday starting Monday][n]
	 */
	const [data, setData] = useState<IDayData[][] | null>(null);
	/**
	 * The data load error that occurred (if any)
	 */
	const [loadError, setLoadError] = useState<Error | null>(null);
	/**
	 * If the date picker is open
	 */
	const [datePickerOpen, setDatePickerOpen] = useState(false);
	/**
	 * The current filter value
	 */
	const [filterValue, setFilterValue] = useState<string | null>(
		filter?.defaultValue ?? null
	);

	const prevWeek = useCallback(() => {
		setWeekOffset((prev) => prev - 1);
	}, []);

	const nextWeek = useCallback(() => {
		setWeekOffset((prev) => prev + 1);
	}, []);

	const handleFilterSelect = useCallback(
		(evt: React.ChangeEvent<HTMLSelectElement>) => {
			setFilterValue(evt.target.value);
		},
		[]
	);

	const today = useCallback(() => {
		setWeekOffset(0);
	}, []);

	const setWeek = useCallback((date: Moment | null) => {
		if (!date) return;

		const start = nowNormalized();
		const end = normalizeMoment(date);
		const week = end.diff(start, "week");

		setWeekOffset(week);
		setDatePickerOpen(false);
	}, []);

	const openDatePicker = useCallback(() => {
		setDatePickerOpen(true);
	}, []);

	const closeDatePicker = useCallback(() => {
		setDatePickerOpen(false);
	}, []);

	useEffect(() => {
		const langChangeHandler = () => {
			setData(null);
			setLoadError(null);
		};
		i18n.on("languageChanged", langChangeHandler);
		return () => {
			i18n.off("languageChanged", langChangeHandler);
		};
	}, [i18n]);

	useEffect(() => {
		setData(null);
		setLoadError(null);

		// fetch data
		void (async () => {
			try {
				const data = await loadData(weekOffset, filterValue);
				setData(data);
			} catch (loadError) {
				setLoadError(loadError as Error);
			}
		})();
	}, [filterValue, loadData, weekOffset]);

	const now = moment();
	const weekday = now.weekday();
	const weekdays = [0, 1, 2, 3, 4, 5, 6].map((day) => day - weekday);

	let prevDate: Moment | null = null;

	return (
		<Grid container alignItems={"stretch"} alignContent={"space-between"}>
			<Grid item xs={12} container wrap={"nowrap"}>
				<Grid item xs>
					<Grid container>
						<Grid item>
							<Button onClick={today} className={classes.todayBtn}>
								{t("standalone.schedule.today")} (
								{now
									.toDate()
									.toLocaleDateString(i18n.language, ToDateLocaleStringOptions)}
								)
							</Button>
						</Grid>
						<Grid item>
							{filter && (
								<Box px={2} className={classes.filterWrapper}>
									<select
										className={classes.filterSelect}
										value={filterValue ?? ""}
										onChange={handleFilterSelect}
									>
										{Object.entries(filter.options).map(([value, label]) => (
											<option value={value} key={value}>
												{label}
											</option>
										))}
									</select>
								</Box>
							)}
						</Grid>
					</Grid>
				</Grid>
				<Grid item>
					<Grid container justifyContent={"center"}>
						<Grid item>
							<IconButton onClick={prevWeek} size="large">
								<ArrowBackIos />
							</IconButton>
							<span onClick={openDatePicker} className={classes.week}>
								{t("standalone.schedule.week")}{" "}
								{nowNormalized().add(weekOffset, "week").week()}{" "}
								{nowNormalized().add(weekOffset, "week").weekYear()}
							</span>
							<div className={classes.picker}>
								qsq
								<LocalizationProvider
									dateAdapter={AdapterMoment}
									adapterLocale={i18n.language}
								>
									<DatePicker
										format={"II RRRR"}
										open={datePickerOpen}
										label={t("standalone.schedule.week")}
										value={nowNormalized().add(weekOffset, "week")}
										onChange={setWeek}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore not declared in typescript def
										onDismiss={closeDatePicker}
									/>
								</LocalizationProvider>
							</div>
							<IconButton onClick={nextWeek} size="large">
								<ArrowForwardIos />
							</IconButton>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs />
			</Grid>
			{loadError && (
				<Grid item xs={12}>
					<Typography align={"center"}>{loadError.message}</Typography>
				</Grid>
			)}
			{!data && !loadError && (
				<Grid item xs={12}>
					<Grid container justifyContent={"space-around"}>
						<CircularProgress />
					</Grid>
				</Grid>
			)}
			{data && (
				<Grid
					item
					xs={12}
					container
					alignItems={"stretch"}
					alignContent={"space-between"}
					wrap={"nowrap"}
				>
					{weekdays.map((day, dayIdx) => {
						const date = now.clone().add(weekOffset, "weeks").add(day, "days");
						const diffDay = !prevDate || prevDate.day() !== date.day();
						const diffMonth = !prevDate || prevDate.month() !== date.month();
						const diffYear = prevDate && prevDate.year() !== date.year();
						prevDate = date;

						let formattedDate = "";
						if (diffYear) formattedDate += `${date.year()} `;
						if (diffMonth) formattedDate += `${date.format("MMMM")} `;
						if (diffDay) formattedDate += date.format("DD");

						const dayData =
							data[(date.weekday() + date.localeData().firstDayOfWeek()) % 7];

						return (
							<WeekViewDay
								key={day}
								dayIdx={dayIdx}
								day={date}
								date={formattedDate}
								data={dayData}
							/>
						);
					})}
				</Grid>
			)}
		</Grid>
	);
};

export default React.memo(WeekView);
