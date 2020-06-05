import React, { Component } from "react";
import { CircularProgress, Divider, Grid } from "@material-ui/core";
import ScrollableScheduleDay from "./ScrollableScheduleDay";
import { WithTranslation, withTranslation } from "react-i18next";
import moment, { Moment } from "moment";
import { IDayData } from "../Common/DayContents";

interface IProps extends WithTranslation {
	moment: Moment;
	setTodayElement: (elem: HTMLElement | null) => void;
}

interface IState {
	data: IDayData[][] | null;
	loadError: Error | null;
}

class ScrollableScheduleWeek extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			data: null,
			loadError: null,
		};
	}

	render() {
		if (this.state.loadError) {
			return (
				<Grid item xs={12}>
					{this.state.loadError.message}
				</Grid>
			);
		}

		if (!this.state.data) {
			return (
				<Grid item xs={12}>
					<Grid container justify={"space-around"}>
						<CircularProgress />
					</Grid>
				</Grid>
			);
		}

		const firstDay = this.props.moment;
		firstDay.subtract(firstDay.weekday(), "days");

		const dayItems = [];
		const now = moment();
		for (let day = 0; day < 7; ++day) {
			const dayMoment = firstDay.clone().add(day, "days");

			if (
				dayMoment.dayOfYear() === now.dayOfYear() &&
				dayMoment.year() === now.year()
			) {
				dayItems.push(
					<ScrollableScheduleDay
						key={day}
						data={this.state.data[day]}
						refFwd={this.props.setTodayElement}
						moment={dayMoment}
					/>
				);
			} else {
				dayItems.push(
					<ScrollableScheduleDay
						key={`${day}`}
						data={this.state.data[day]}
						moment={dayMoment}
					/>
				);
			}
		}

		const endOfWeek = firstDay.clone().add(6, "days");
		return (
			<>
				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={1} />
				<Grid item xs={11}>
					{this.props.t("standalone.schedule.week")} {firstDay.week()},{" "}
					{firstDay.format("DD MMM")} - {endOfWeek.format("DD MMM")}
				</Grid>
				{dayItems}
			</>
		);
	}
}

export default withTranslation()(ScrollableScheduleWeek);
