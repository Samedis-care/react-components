import React, { PureComponent, useId } from "react";
import {
	Alert,
	AlertTitle,
	Button,
	CircularProgress,
	Divider,
	Grid,
	styled,
} from "@mui/material";
import ScrollableScheduleDay from "./ScrollableScheduleDay";
import moment, { Moment } from "moment";
import { IDayData } from "../Common/DayContents";
import { WithTranslation } from "react-i18next";
import useCCTranslations from "../../../utils/useCCTranslations";
import type { LoadWeekCallback } from "./index";
import focusRing from "../../../utils/internal/focusRing";

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
	 * Loads the week, called with `weekOffset` and `filterValues` on mount,
	 * again when one of the three changes, and when the user retries a failed
	 * week. The rows shown stay until the new result arrives; the result of an
	 * earlier call that arrives later is ignored.
	 */
	loadWeekCallback: LoadWeekCallback;
	/**
	 * The filter values passed to `loadWeekCallback`
	 */
	filterValues: Record<string, string | boolean>;
	/**
	 * Unique prefix for the ids of the week's elements (from `useId`)
	 */
	idPrefix: string;
}

interface IState {
	data: IDayData[][] | null;
	/**
	 * The last load failed: the text shown below the error's title (see
	 * getErrorText), "" when the failure has none. null while no load failed.
	 */
	loadError: string | null;
	/**
	 * The user asked to load the failed week again and that load is pending:
	 * the week shows its week line and a spinner instead of the error
	 */
	retrying: boolean;
}

// MUI's own keyboard focus is a tint, which forced colors drop
const RetryButton = styled(Button)(({ theme }) => ({
	"&.Mui-focusVisible": focusRing(theme, 2),
}));

// the week line is a heading for assistive technology and looks like the text
// around it; typeof Grid keeps the `component` prop, which styled() drops
const WeekHeading = styled(Grid)({
	margin: 0,
	font: "inherit",
}) as typeof Grid;

/**
 * The text a failed load shows below the error's title "Week N could not be
 * loaded": the `message` of an Error, or of any other object with a string
 * `message`, and a string as it is. Any other value (`undefined`, `null`, a
 * number, an object without a message such as a fetch Response) has none, so
 * the alert shows its title only.
 * @param reason What loadWeekCallback rejected with or threw
 */
const getErrorText = (reason: unknown): string => {
	if (typeof reason === "string") return reason;
	if (
		typeof reason === "object" &&
		reason !== null &&
		"message" in reason &&
		typeof reason.message === "string"
	) {
		return reason.message;
	}
	return "";
};

/**
 * What a value is, for the error of a result that is not a week: `null`,
 * `undefined`, "an object", "a string", …
 * @param value The value
 */
const describeValue = (value: unknown): string => {
	if (value === null || value === undefined) return String(value);
	return typeof value === "object" ? "an object" : `a ${typeof value}`;
};

/**
 * Checks a result of loadWeekCallback: a week is an array of exactly 7 days,
 * each an array of entries. Anything else (fewer or more days, `null`,
 * `undefined`, an object, a day that is not an array) throws an Error that says
 * what the result is instead, so the week's load fails with it.
 * @param result What loadWeekCallback returned or its promise resolved with
 * @returns The result, which is a week
 * @throws Error "ScrollableSchedule: loadWeekCallback must return 7 days, got …"
 */
const checkWeek = (result: unknown): IDayData[][] => {
	const expected = "ScrollableSchedule: loadWeekCallback must return 7 days";
	if (!Array.isArray(result)) {
		throw new Error(`${expected}, got ${describeValue(result)}`);
	}
	const days: unknown[] = result;
	if (days.length !== 7) {
		throw new Error(`${expected}, got ${days.length}`);
	}
	const badDay = days.findIndex((day) => !Array.isArray(day));
	if (badDay !== -1) {
		throw new Error(
			`${expected}, each an array of entries, got ${describeValue(days[badDay])} at index ${badDay}`,
		);
	}
	return days as IDayData[][];
};

/**
 * One week of ScrollableSchedule: a spinner while it loads, then its week line
 * and its day rows. The week line is an `h3` heading, "Week N, DD MMM -
 * DD MMM YYYY" (both years for a week that runs into the next one). When the
 * load fails, whatever it rejects with, or its result is not 7 days (see
 * checkWeek), the week line stays and an alert names the week and shows the
 * error's message (see getErrorText), with a Retry button that loads the week
 * again.
 */
class ScrollableScheduleWeek extends PureComponent<IProps, IState> {
	/**
	 * Counts the loads started; a result is applied only if no other load
	 * started after it and the week is still mounted
	 */
	private loadId = 0;
	/**
	 * The week line; it stays in place from the failed week to the retry and
	 * the loaded week, so it takes the focus from the Retry button
	 */
	private weekLine = React.createRef<HTMLHeadingElement>();

	constructor(props: IProps) {
		super(props);

		this.state = {
			data: null,
			loadError: null,
			retrying: false,
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
				// a result that is not a week fails the load like a rejection
				const data = checkWeek(
					await loadWeekCallback(weekOffset, filterValues),
				);
				if (loadId !== this.loadId) return;
				this.setState({
					data,
					loadError: null,
					retrying: false,
				});
			} catch (e) {
				if (loadId !== this.loadId) return;
				this.setState({
					data: null,
					loadError: getErrorText(e),
					retrying: false,
				});
			}
		})();
	}

	/**
	 * Loads the failed week again. The Retry button goes away with the error,
	 * so the focus moves to the week line, which stays.
	 */
	private retry = (): void => {
		this.weekLine.current?.focus();
		this.setState({ retrying: true });
		this.load();
	};

	/**
	 * The spinner of a pending load: the whole week while it first loads, below
	 * the week line while a retry is pending
	 */
	private renderProgress(): React.ReactElement {
		return (
			<Grid size={12}>
				<Grid container sx={{ justifyContent: "space-around" }}>
					<CircularProgress />
				</Grid>
			</Grid>
		);
	}

	render(): React.ReactElement {
		const { data, loadError, retrying } = this.state;
		const { t, idPrefix } = this.props;

		if (!data && loadError === null) {
			return this.renderProgress();
		}

		const firstDay = this.props.today
			.clone()
			.add(this.props.weekOffset, "weeks");
		firstDay.subtract(firstDay.weekday(), "days");

		const dayItems = [];
		const now = moment();
		for (let day = 0; data && day < 7; ++day) {
			const dayMoment = firstDay.clone().add(day, "days");

			if (
				dayMoment.dayOfYear() === now.dayOfYear() &&
				dayMoment.year() === now.year()
			) {
				dayItems.push(
					<ScrollableScheduleDay
						key={day}
						data={data[day]}
						ref={this.props.setTodayElement}
						moment={dayMoment}
						today
					/>,
				);
			} else {
				dayItems.push(
					<ScrollableScheduleDay
						key={`${day}`}
						data={data[day]}
						moment={dayMoment}
					/>,
				);
			}
		}

		const errorId = `${idPrefix}-error`;
		const endOfWeek = firstDay.clone().add(6, "days");
		const startFormat =
			firstDay.year() === endOfWeek.year() ? "DD MMM" : "DD MMM YYYY";
		return (
			<>
				<Grid size={12}>
					<Divider />
				</Grid>
				<Grid size={1} />
				<WeekHeading size={11} component="h3" ref={this.weekLine} tabIndex={-1}>
					{t("standalone.schedule.week")} {firstDay.week()},{" "}
					{firstDay.format(startFormat)} - {endOfWeek.format("DD MMM YYYY")}
				</WeekHeading>
				{data ? (
					dayItems
				) : retrying ? (
					this.renderProgress()
				) : (
					<Grid size={11} offset={1}>
						<Alert
							severity="error"
							slotProps={{ message: { id: errorId } }}
							action={
								<RetryButton
									color="inherit"
									size="small"
									onClick={this.retry}
									aria-describedby={errorId}
								>
									{t("standalone.schedule.retry")}
								</RetryButton>
							}
						>
							<AlertTitle>
								{t("standalone.schedule.week-load-error", {
									WEEK: firstDay.week(),
								})}
							</AlertTitle>
							{loadError}
						</Alert>
					</Grid>
				)}
			</>
		);
	}
}

const ScrollableScheduleWeekWithTranslation = (
	props: Omit<IProps, keyof WithTranslation | "idPrefix">,
): React.ReactElement => {
	const { i18n, t, ready: tReady } = useCCTranslations();
	const idPrefix = useId();
	return (
		<ScrollableScheduleWeek
			{...props}
			idPrefix={idPrefix}
			i18n={i18n}
			t={t}
			tReady={tReady}
		/>
	);
};

export default ScrollableScheduleWeekWithTranslation;
