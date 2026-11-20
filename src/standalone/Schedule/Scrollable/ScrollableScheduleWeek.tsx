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
	loadError: Error | null;
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

/**
 * One week of ScrollableSchedule: a spinner while it loads, then a "Week N,
 * DD MMM - DD MMM" line and its day rows. When the load fails, the week line
 * stays and an alert names the week and shows the error's message, with a
 * Retry button that loads the week again.
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
	private weekLine = React.createRef<HTMLDivElement>();

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
				const data = await loadWeekCallback(weekOffset, filterValues);
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
					loadError: e as Error,
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

		if (!data && !loadError) {
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
		return (
			<>
				<Grid size={12}>
					<Divider />
				</Grid>
				<Grid size={1} />
				<Grid size={11} ref={this.weekLine} tabIndex={-1}>
					{t("standalone.schedule.week")} {firstDay.week()},{" "}
					{firstDay.format("DD MMM")} - {endOfWeek.format("DD MMM")}
				</Grid>
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
							{loadError?.message}
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
