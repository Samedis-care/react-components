import React, { PureComponent } from "react";
import { CircularProgress, Divider, Grid } from "@mui/material";
import ScrollableScheduleDay from "./ScrollableScheduleDay";
import moment, { Moment } from "moment";
import { IDayData } from "../Common/DayContents";
import { WithTranslation } from "react-i18next";
import useCCTranslations from "../../../utils/useCCTranslations";
import type { LoadWeekCallback } from "./index";

export interface IProps extends WithTranslation {
	/**
	 * The week to display, in weeks relative to the week of `today`
	 */
	weekOffset: number;
	/**
	 * The day the week offsets count from (ScrollableSchedule's today); not
	 * modified
	 */
	today: Moment;
	/**
	 * Callback which gets called to set the HTML element for today, used for
	 * jumpToToday
	 * @param elem The HTML element
	 */
	setTodayElement: (elem: HTMLElement | null) => void;
	/**
	 * Loads the week, called with `weekOffset` and `filterValues` on mount and
	 * again when one of the three changes. The rows shown stay until the new
	 * result arrives; the result of an earlier call that arrives later is
	 * ignored.
	 */
	loadWeekCallback: LoadWeekCallback;
	/**
	 * The filter values passed to `loadWeekCallback`
	 */
	filterValues: Record<string, string | boolean>;
}

interface IState {
	data: IDayData[][] | null;
	loadError: Error | null;
}

class ScrollableScheduleWeek extends PureComponent<IProps, IState> {
	/**
	 * Counts the loads started; a result is applied only if no other load
	 * started after it and the week is still mounted
	 */
	private loadId = 0;

	constructor(props: IProps) {
		super(props);

		this.state = {
			data: null,
			loadError: null,
		};
	}

	componentDidMount(): void {
		this.load();
	}

	componentDidUpdate(prevProps: Readonly<IProps>): void {
		if (
			prevProps.loadWeekCallback !== this.props.loadWeekCallback ||
			prevProps.weekOffset !== this.props.weekOffset ||
			prevProps.filterValues !== this.props.filterValues
		) {
			this.load();
		}
	}

	componentWillUnmount(): void {
		++this.loadId;
	}

	load(): void {
		const loadId = ++this.loadId;
		const { loadWeekCallback, weekOffset, filterValues } = this.props;
		void (async () => {
			try {
				const data = await loadWeekCallback(weekOffset, filterValues);
				if (loadId !== this.loadId) return;
				this.setState({
					data,
					loadError: null,
				});
			} catch (e) {
				if (loadId !== this.loadId) return;
				this.setState({
					data: null,
					loadError: e as Error,
				});
			}
		})();
	}

	render(): React.ReactElement {
		if (this.state.loadError) {
			return <Grid size={12}>{this.state.loadError.message}</Grid>;
		}

		if (!this.state.data) {
			return (
				<Grid size={12}>
					<Grid container sx={{ justifyContent: "space-around" }}>
						<CircularProgress />
					</Grid>
				</Grid>
			);
		}

		const firstDay = this.props.today
			.clone()
			.add(this.props.weekOffset, "weeks");
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
						ref={this.props.setTodayElement}
						moment={dayMoment}
						today
					/>,
				);
			} else {
				dayItems.push(
					<ScrollableScheduleDay
						key={`${day}`}
						data={this.state.data[day]}
						moment={dayMoment}
					/>,
				);
			}
		}

		const endOfWeek = firstDay.clone().add(6, "days");
		return (
			<>
				<Grid size={12}>
					<Divider />
				</Grid>
				<Grid size={1} />
				<Grid size={11}>
					{this.props.t("standalone.schedule.week")} {firstDay.week()},{" "}
					{firstDay.format("DD MMM")} - {endOfWeek.format("DD MMM")}
				</Grid>
				{dayItems}
			</>
		);
	}
}

const ScrollableScheduleWeekWithTranslation = (
	props: Omit<IProps, keyof WithTranslation>,
): React.ReactElement => {
	const { i18n, t, ready: tReady } = useCCTranslations();
	return (
		<ScrollableScheduleWeek {...props} i18n={i18n} t={t} tReady={tReady} />
	);
};

export default ScrollableScheduleWeekWithTranslation;
