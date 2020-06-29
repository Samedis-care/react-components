import React, { PureComponent } from "react";
import Grid from "@material-ui/core/Grid";
import WeekViewDay from "./WeekViewDay";
import moment, { Moment } from "moment";
import {
	CircularProgress,
	IconButton,
	WithStyles,
	withStyles,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { WithTranslation, withTranslation } from "react-i18next";
import i18n from "../../../i18n";
import { IDayData } from "../Common/DayContents";
import { ArrowForwardIos, ArrowBackIos } from "@material-ui/icons";

export interface IProps extends WithStyles, WithTranslation {
	/**
	 * Callback to load data of this week
	 * @param weekOffset
	 */
	loadData: (weekOffset: number) => Promise<IDayData[][]>;
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
}

class WeekView extends PureComponent<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			weekOffset: 0,
			data: null,
			loadError: null,
		};
	}

	componentDidMount() {
		this.fetchData().then();
		i18n.on("languageChanged", this.fetchData);
	}

	componentWillUnmount() {
		i18n.off("languageChanged", this.fetchData);
	}

	render() {
		const now = moment();
		const weekday = now.weekday();
		const weekdays = [0, 1, 2, 3, 4, 5, 6];
		for (const index in weekdays) weekdays[index] -= weekday;

		let prevDate: Moment | null = null;

		return (
			<Grid container alignItems={"stretch"} alignContent={"space-between"}>
				<Grid item xs={4}>
					<Button onClick={this.today} className={this.props.classes.todayBtn}>
						{this.props.t("standalone.schedule.today")} (
						{now.toDate().toLocaleDateString()})
					</Button>
				</Grid>
				<Grid item xs={4}>
					<Typography align={"center"}>
						<IconButton onClick={this.prevWeek}>
							<ArrowBackIos />
						</IconButton>
						{this.props.t("standalone.schedule.week")}{" "}
						{now.week() + this.state.weekOffset}
						<IconButton onClick={this.nextWeek}>
							<ArrowForwardIos />
						</IconButton>
					</Typography>
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
				{this.state.data &&
					weekdays.map((day) => {
						const date = now
							.clone()
							.add(this.state.weekOffset, "weeks")
							.add(day, "days");
						const diffDay = !prevDate || prevDate.day() !== date.day();
						const diffMonth = !prevDate || prevDate.month() !== date.month();
						const diffYear = prevDate && prevDate.year() !== date.year();
						prevDate = date;

						let formattedDate = "";
						if (diffYear) formattedDate += date.year() + " ";
						if (diffMonth) formattedDate += date.format("MMMM") + " ";
						if (diffDay) formattedDate += date.format("DD");

						const dayData = this.state.data![
							(date.weekday() + date.localeData().firstDayOfWeek()) % 7
						];

						return (
							<WeekViewDay
								key={day}
								day={date}
								date={formattedDate}
								data={dayData}
							/>
						);
					})}
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
			this.fetchData
		);

	nextWeek = () =>
		this.setState(
			(prevState) => ({
				weekOffset: prevState.weekOffset + 1,
				data: null,
				loadError: null,
			}),
			this.fetchData
		);

	today = () =>
		this.setState(
			{
				weekOffset: 0,
				data: null,
				loadError: null,
			},
			this.fetchData
		);

	fetchData = async () => {
		try {
			const data = await this.props.loadData(this.state.weekOffset);
			this.setState({
				data,
			});
		} catch (loadError) {
			this.setState({
				loadError,
			});
		}
	};
}

export default withStyles((_theme) => ({
	todayBtn: {
		height: "100%",
	},
}))(withTranslation()(WeekView));
