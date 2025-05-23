import React, { useCallback, useEffect, useState } from "react";
import WeekViewDay from "./WeekViewDay";
import moment, { Moment } from "moment";
import {
	Box,
	Button,
	CircularProgress,
	Divider,
	Grid,
	IconButton,
	Menu,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import {
	IDayData,
	ScheduleAction,
	ScheduleFilterDefinition,
} from "../Common/DayContents";
import {
	ArrowBackIos,
	ArrowForwardIos,
	Settings as SettingsIcon,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ToDateLocaleStringOptions } from "../../../constants";
import useCCTranslations from "../../../utils/useCCTranslations";
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
	/**
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<WeekViewClassKey, string>>;
}

const normalizeMoment = (instance: Moment) =>
	instance.weekday(0).hour(0).minute(0).second(0).millisecond(0);
const nowNormalized = () => normalizeMoment(moment());

const Root = styled(Grid, { name: "CcWeekView", slot: "root" })({});

const TodayBtn = styled(Button, { name: "CcWeekView", slot: "todayBtn" })({
	height: "100%",
});

const FilterWrapper = styled(Box, {
	name: "CcWeekView",
	slot: "filterWrapper",
})({
	top: "50%",
	position: "relative",
	transform: "translateY(-50%)",
});

const LoadWrapper = styled(Grid, { name: "CcWeekView", slot: "loadWrapper" })({
	minHeight: 204,
});

const Week = styled("span", { name: "CcWeekView", slot: "week" })({
	cursor: "pointer",
});

const Picker = styled("div", { name: "CcWeekView", slot: "picker" })({
	opacity: 0,
	position: "absolute",
	pointerEvents: "none",
	marginTop: -64,
});

export type WeekViewClassKey =
	| "root"
	| "todayBtn"
	| "loadWrapper"
	| "filterWrapper"
	| "week"
	| "picker";

const EMPTY_FILTERS: Record<string, ScheduleFilterDefinition> = {};
const NO_ACTIONS: ScheduleAction[] = [];
const WeekView = (inProps: WeekViewProps) => {
	const props = useThemeProps({ props: inProps, name: "CcWeekView" });
	const { loadData, className, classes } = props;
	const filters = props.filters ?? EMPTY_FILTERS;
	const actions = props.actions ?? NO_ACTIONS;
	const filterCount = Object.keys(filters).length;
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
		<Root
			container
			alignItems={"stretch"}
			alignContent={"space-between"}
			className={className}
		>
			<Grid container wrap={"nowrap"} size={12}>
				<Grid size="grow">
					<Grid container>
						<Grid>
							<TodayBtn onClick={today} className={classes?.todayBtn}>
								{t("standalone.schedule.today")} (
								{now
									.toDate()
									.toLocaleDateString(i18n.language, ToDateLocaleStringOptions)}
								)
							</TodayBtn>
						</Grid>
						<Grid>
							{filterCount > 0 && (
								<FilterWrapper px={2} className={classes?.filterWrapper}>
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
								</FilterWrapper>
							)}
						</Grid>
					</Grid>
				</Grid>
				<Grid>
					<Grid container justifyContent={"center"}>
						<Grid>
							<IconButton onClick={prevWeek} size="large">
								<ArrowBackIos />
							</IconButton>
							<Week onClick={openDatePicker} className={classes?.week}>
								{t("standalone.schedule.week")}{" "}
								{nowNormalized().add(weekOffset, "week").week()}{" "}
								{nowNormalized().add(weekOffset, "week").weekYear()}
							</Week>
							<Picker className={classes?.picker}>
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
							</Picker>
							<IconButton onClick={nextWeek} size="large">
								<ArrowForwardIos />
							</IconButton>
						</Grid>
					</Grid>
				</Grid>
				<Grid container justifyContent={"flex-end"} size="grow">
					{(filterCount > 1 || actions.length > 0) && (
						<Grid>
							<FilterWrapper px={2} className={classes?.filterWrapper}>
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
																<Grid key={"filter-" + name} size={12}>
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
														<Grid key={"divider"} size={12}>
															<Divider />
														</Grid>
													)}
													{actions.length > 1 &&
														actions.map(
															(action, idx) =>
																idx !== 0 && (
																	<Grid key={"action-" + action.id} size={12}>
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
													<Grid key={"action-" + action.id}>
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
													<Grid key={"filter-" + name}>
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
							</FilterWrapper>
						</Grid>
					)}
				</Grid>
			</Grid>
			{loadError && (
				<Grid size={12}>
					<Typography align={"center"}>{loadError.message}</Typography>
				</Grid>
			)}
			{!data && !loadError && (
				<LoadWrapper size={12}>
					<Grid container justifyContent={"space-around"}>
						<CircularProgress />
					</Grid>
				</LoadWrapper>
			)}
			{data && (
				<Grid
					container
					alignItems={"stretch"}
					alignContent={"space-between"}
					wrap={"nowrap"}
					size={12}
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
		</Root>
	);
};

export default React.memo(WeekView);
