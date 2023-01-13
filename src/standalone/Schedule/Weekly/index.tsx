import React, { PureComponent } from "react";
import WeekViewDay from "./WeekViewDay";
import moment, { Moment } from "moment";
import {
	Box,
	CircularProgress,
	createStyles,
	IconButton,
	WithStyles,
	withStyles,
} from "@material-ui/core";
import { Button, Typography, Grid } from "@material-ui/core";
import { IDayData, ScheduleFilterDefinition } from "../Common/DayContents";
import { ArrowForwardIos, ArrowBackIos } from "@material-ui/icons";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { ToDateLocaleStringOptions } from "../../../constants";
import { WithTranslation } from "react-i18next";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface IProps extends WithStyles, WithTranslation {
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

interface IState {
	/**
	 * The offset to the current week
	 * Example: -1 for last week, 0 for this week, 1 for next week
	 */
	weekOffset: number;
	/**
	 * The day contents data for this week
	 * Format: IDayData[weekday starting Monday][n]
	 */
	data: IDayData[][] | null;
	/**
	 * The data load error that occurred (if any)
	 */
	loadError: Error | null;
	/**
	 * If the date picker is open
	 */
	datePickerOpen: boolean;
	/**
	 * The current filter value
	 */
	filterValue: string | null;
}

class WeekView extends PureComponent<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			weekOffset: 0,
			data: null,
			loadError: null,
			datePickerOpen: false,
			filterValue: props.filter?.defaultValue ?? null,
		};
	}

	componentDidMount() {
		void this.fetchData();
		this.props.i18n.on("languageChanged", () => {
			void this.fetchData();
		});
	}

	componentWillUnmount() {
		this.props.i18n.off("languageChanged", () => {
			void this.fetchData();
		});
	}

	render() {
		const now = moment();
		const weekday = now.weekday();
		const weekdays = [0, 1, 2, 3, 4, 5, 6].map((day) => day - weekday);

		let prevDate: Moment | null = null;

		return (
			<Grid container alignItems={"stretch"} alignContent={"space-between"}>
				<Grid item xs={4}>
					<Grid container>
						<Grid item>
							<Button
								onClick={this.today}
								className={this.props.classes.todayBtn}
							>
								{this.props.t("standalone.schedule.today")} (
								{now
									.toDate()
									.toLocaleDateString(
										this.props.i18n.language,
										ToDateLocaleStringOptions
									)}
								)
							</Button>
						</Grid>
						<Grid item>
							{this.props.filter && (
								<Box px={2} className={this.props.classes.filterWrapper}>
									<select
										className={this.props.classes.filterSelect}
										value={this.state.filterValue ?? ""}
										onChange={this.handleFilterSelect}
									>
										{Object.entries(this.props.filter.options).map(
											([value, label]) => (
												<option value={value} key={value}>
													{label}
												</option>
											)
										)}
									</select>
								</Box>
							)}
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={4}>
					<Grid container justify={"center"}>
						<Grid item>
							<IconButton onClick={this.prevWeek}>
								<ArrowBackIos />
							</IconButton>
							<span
								onClick={this.openDatePicker}
								className={this.props.classes.week}
							>
								{this.props.t("standalone.schedule.week")}{" "}
								{this.nowNormalized().add(this.state.weekOffset, "week").week()}{" "}
								{this.nowNormalized()
									.add(this.state.weekOffset, "week")
									.weekYear()}
							</span>
							<div className={this.props.classes.picker}>
								qsq
								<MuiPickersUtilsProvider utils={MomentUtils}>
									<DatePicker
										variant={"dialog"}
										format={"II RRRR"}
										open={this.state.datePickerOpen}
										label={this.props.t("standalone.schedule.week")}
										value={this.nowNormalized()
											.add(this.state.weekOffset, "week")
											.toDate()}
										onChange={this.setWeek}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore not declared in typescript def
										onDismiss={this.closeDatePicker}
									/>
								</MuiPickersUtilsProvider>
							</div>
							<IconButton onClick={this.nextWeek}>
								<ArrowForwardIos />
							</IconButton>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={4} />
				{this.state.loadError && (
					<Grid item xs={12}>
						<Typography align={"center"}>
							{this.state.loadError.message}
						</Typography>
					</Grid>
				)}
				{!this.state.data && !this.state.loadError && (
					<Grid item xs={12}>
						<Grid container justify={"space-around"}>
							<CircularProgress />
						</Grid>
					</Grid>
				)}
				{this.state.data && (
					<Grid
						item
						xs={12}
						container
						alignItems={"stretch"}
						alignContent={"space-between"}
						wrap={"nowrap"}
						className={this.props.classes.content}
					>
						{weekdays.map((day, dayIdx) => {
							const data = this.state.data;
							if (!data) return null;

							const date = now
								.clone()
								.add(this.state.weekOffset, "weeks")
								.add(day, "days");
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
	}

	prevWeek = () =>
		this.setState(
			(prevState) => ({
				weekOffset: prevState.weekOffset - 1,
				data: null,
				loadError: null,
			}),
			() => {
				void this.fetchData();
			}
		);

	nextWeek = () =>
		this.setState(
			(prevState) => ({
				weekOffset: prevState.weekOffset + 1,
				data: null,
				loadError: null,
			}),
			() => {
				void this.fetchData();
			}
		);

	handleFilterSelect = (evt: React.ChangeEvent<HTMLSelectElement>) =>
		this.setState(
			{
				data: null,
				loadError: null,
				filterValue: evt.target.value,
			},
			() => {
				void this.fetchData();
			}
		);

	today = () =>
		this.setState(
			{
				weekOffset: 0,
				data: null,
				loadError: null,
			},
			() => {
				void this.fetchData();
			}
		);

	setWeek = (date: MaterialUiPickersDate) => {
		const start = this.nowNormalized();
		const end = this.momentNormalize(moment(date));
		const week = end.diff(start, "week");

		this.setState(
			{
				weekOffset: week,
				data: null,
				loadError: null,
				datePickerOpen: false,
			},
			() => {
				void this.fetchData();
			}
		);
	};

	fetchData = async () => {
		try {
			const data = await this.props.loadData(
				this.state.weekOffset,
				this.state.filterValue
			);
			this.setState({
				data,
			});
		} catch (loadError) {
			this.setState({
				loadError: loadError as Error,
			});
		}
	};

	nowNormalized = () => this.momentNormalize(moment());
	momentNormalize = (instance: Moment) =>
		instance.weekday(0).hour(0).minute(0).second(0).millisecond(0);

	openDatePicker = () =>
		this.setState({
			datePickerOpen: true,
		});

	closeDatePicker = () =>
		this.setState({
			datePickerOpen: false,
		});
}

const styles = createStyles({
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
});

const WeekViewWithoutTranslation = withStyles(styles)(WeekView);
const WeekViewWithTranslation = (
	props: Omit<IProps, keyof WithTranslation | keyof WithStyles>
): React.ReactElement => {
	const { i18n, t, ready: tReady } = useCCTranslations();
	return (
		<WeekViewWithoutTranslation {...props} i18n={i18n} t={t} tReady={tReady} />
	);
};

export default WeekViewWithTranslation;
