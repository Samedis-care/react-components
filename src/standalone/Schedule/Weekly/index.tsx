import React, { useCallback, useEffect, useState } from "react";
import WeekViewDay from "./WeekViewDay";
import moment, { Moment } from "moment";
import {
	Box,
	CircularProgress,
	Divider,
	IconButton,
	Menu,
} from "@mui/material";
import { Button, Typography, Grid } from "@mui/material";
import {
	IDayData,
	ScheduleAction,
	ScheduleFilterDefinition,
} from "../Common/DayContents";
import {
	ArrowForwardIos,
	ArrowBackIos,
	Settings as SettingsIcon,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ToDateLocaleStringOptions } from "../../../constants";
import useCCTranslations from "../../../utils/useCCTranslations";
import makeStyles from "@mui/styles/makeStyles";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import ScheduleFilterRenderer from "../Common/ScheduleFilterRenderers";

export interface WeekViewProps {
	/**
	 * Callback to load data of this week
	 * @param weekOffset The offset to the current week
	 * @param filter The selected filter(s)
	 */
	loadData: (
		weekOffset: number,
		filter: Record<string, string | boolean>,
	) => IDayData[][] | Promise<IDayData[][]>;

	/**
	 * Optional filter
	 */
	filters?: Record<string, ScheduleFilterDefinition>;
	/**
	 * Optional actions
	 */
	actions?: ScheduleAction[];
}

const normalizeMoment = (instance: Moment) =>
	instance.weekday(0).hour(0).minute(0).second(0).millisecond(0);
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
			opacity: 0,
			position: "absolute",
			pointerEvents: "none",
			marginTop: -64,
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
	{ name: "CcWeekView" },
);

const EMPTY_FILTERS: Record<string, ScheduleFilterDefinition> = {};
const NO_ACTIONS: ScheduleAction[] = [];
const WeekView = (props: WeekViewProps) => {
	const { loadData } = props;
	const filters = props.filters ?? EMPTY_FILTERS;
	const actions = props.actions ?? NO_ACTIONS;
	const filterCount = Object.keys(filters).length;
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
	const [datePickerAnchorEl, setDatePickerAnchorEl] =
		useState<HTMLElement | null>(null);
	/**
	 * The current filter value
	 */
	const [filterValues, setFilterValues] = useState<
		Record<string, string | boolean>
	>(() =>
		Object.fromEntries(
			Object.entries(filters).map(([name, filter]) => [
				name,
				filter.defaultValue,
			]),
		),
	);

	const prevWeek = useCallback(() => {
		setWeekOffset((prev) => prev - 1);
	}, []);

	const nextWeek = useCallback(() => {
		setWeekOffset((prev) => prev + 1);
	}, []);

	const handleFilterChange = useCallback(
		(evt: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
			const value =
				evt.target.type === "checkbox"
					? (evt.target as HTMLInputElement).checked
					: evt.target.value;
			setFilterValues((prev) => ({
				...prev,
				[evt.target.name]: value,
			}));
			if (!props.filters) return;
			const changeHandler = props.filters[evt.target.name].onChange as (
				newFilter: string | boolean,
			) => void;
			if (changeHandler) changeHandler(value);
		},
		[props.filters],
	);

	const [filterSettingsAnchorEl, setFilterSettingsAnchorEl] =
		useState<HTMLElement | null>(null);
	const openFilterSettings = useCallback(
		(evt: React.MouseEvent<HTMLElement>) => {
			setFilterSettingsAnchorEl(evt.currentTarget);
		},
		[],
	);
	const closeFiltersMenu = useCallback(() => {
		setFilterSettingsAnchorEl(null);
	}, []);

	const today = useCallback(() => {
		setWeekOffset(0);
	}, []);

	const setWeek = useCallback((date: Moment | null) => {
		if (!date) return;

		const start = nowNormalized();
		const end = normalizeMoment(date);
		const week = end.diff(start, "week");

		setWeekOffset(week);
		setDatePickerAnchorEl(null);
	}, []);

	const openDatePicker = useCallback((evt: React.MouseEvent<HTMLElement>) => {
		setDatePickerAnchorEl(evt.currentTarget);
	}, []);

	const closeDatePicker = useCallback(() => {
		setDatePickerAnchorEl(null);
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
				const data = await loadData(weekOffset, filterValues);
				setData(data);
			} catch (loadError) {
				setLoadError(loadError as Error);
			}
		})();
	}, [filterValues, loadData, weekOffset]);

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
							{filterCount > 0 && (
								<Box px={2} className={classes.filterWrapper}>
									{(() => {
										const [name, filter] = Object.entries(filters)[0];
										return (
											<ScheduleFilterRenderer
												{...filter}
												name={name}
												value={filterValues[name]}
												onChange={handleFilterChange}
												inline={"weekly"}
											/>
										);
									})()}
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
								<LocalizationProvider
									dateAdapter={AdapterMoment}
									adapterLocale={i18n.language}
								>
									<DatePicker
										format={"II RRRR"}
										open={datePickerAnchorEl != null}
										label={t("standalone.schedule.week")}
										value={nowNormalized().add(weekOffset, "week")}
										onChange={setWeek}
										onClose={closeDatePicker}
									/>
								</LocalizationProvider>
							</div>
							<IconButton onClick={nextWeek} size="large">
								<ArrowForwardIos />
							</IconButton>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs container justifyContent={"flex-end"}>
					{(filterCount > 1 || actions.length > 0) && (
						<Grid item>
							<Box px={2} className={classes.filterWrapper}>
								{filterCount > 2 || actions.length > 1 ? (
									<>
										<IconButton onClick={openFilterSettings}>
											<SettingsIcon />
										</IconButton>
										<Menu
											open={filterSettingsAnchorEl != null}
											anchorEl={filterSettingsAnchorEl}
											onClose={closeFiltersMenu}
										>
											<Box p={1}>
												<Grid container spacing={1}>
													{Object.entries(filters).map(
														([name, filter], idx) =>
															idx !== 0 && (
																<Grid key={"filter-" + name} item xs={12}>
																	<ScheduleFilterRenderer
																		{...filter}
																		name={name}
																		value={
																			filter.type === "select"
																				? (filterValues[name] as string)
																				: (filterValues[name] as boolean)
																		}
																		onChange={handleFilterChange}
																	/>
																</Grid>
															),
													)}
													{filterCount > 2 && (
														<Grid item key={"divider"} xs={12}>
															<Divider />
														</Grid>
													)}
													{actions.length > 1 &&
														actions.map(
															(action, idx) =>
																idx !== 0 && (
																	<Grid
																		item
																		key={"action-" + action.id}
																		xs={12}
																	>
																		<Button
																			onClick={action.onClick}
																			disabled={action.disabled}
																			fullWidth
																		>
																			{action.label}
																		</Button>
																	</Grid>
																),
														)}
												</Grid>
											</Box>
										</Menu>
									</>
								) : (
									<Grid
										container
										spacing={2}
										wrap={"nowrap"}
										alignItems={"center"}
									>
										{(() => {
											const ret: React.ReactNode[] = [];
											if (actions.length > 0) {
												const action = actions[0];
												ret.push(
													<Grid item key={"action-" + action.id}>
														<Button
															onClick={action.onClick}
															disabled={action.disabled}
														>
															{action.label}
														</Button>
													</Grid>,
												);
											}
											if (filterCount > 1) {
												const [name, filter] = Object.entries(filters)[1];
												ret.push(
													<Grid item key={"filter-" + name}>
														<ScheduleFilterRenderer
															{...filter}
															name={name}
															value={filterValues[name]}
															onChange={handleFilterChange}
															inline={"weekly"}
														/>
													</Grid>,
												);
											}
											return ret;
										})()}
									</Grid>
								)}
							</Box>
						</Grid>
					)}
				</Grid>
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
