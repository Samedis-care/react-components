import React, { PureComponent } from "react";
import {
	Grid,
	WithStyles,
	withStyles,
	Box,
	Button,
	Theme,
	createStyles,
} from "@material-ui/core";
import moment, { Moment } from "moment";
import ScrollableScheduleWeek from "./ScrollableScheduleWeek";
import InfiniteScroll from "../../InfiniteScroll";
import { IDayData, ScheduleFilterDefinition } from "../Common/DayContents";
import i18n from "../../../i18n";
import { combineClassNames } from "../../../utils";

/**
 * Callback to load week data from a data source
 * @param weekOffset The week relative to the current week of year
 * 					 Example: -1 for last week, 0 for this week, 1 for next week
 * @param filter The filter selected by the user
 * @returns A promise containing the data for the days of the week, may throw an
 * 			error. Format: IDayData[weekday starting Monday][n]
 */
export type LoadWeekCallback = (
	weekOffset: number,
	filter: string | null
) => IDayData[][] | Promise<IDayData[][]>;

export interface ScrollableScheduleProps extends WithStyles {
	/**
	 * CSS Class which specifies the infinite scroll height
	 */
	wrapperClass: string;
	/**
	 * The callback to load data for a week
	 */
	loadWeekCallback: LoadWeekCallback;

	/**
	 * Optional filter
	 */
	filter?: ScheduleFilterDefinition;
}

/**
 * Outdated alias
 * @deprecated use ScrollableScheduleProps
 */
export type IProps = ScrollableScheduleProps;

interface IState {
	/**
	 * Array of ScrollableScheduleWeek components
	 */
	items: JSX.Element[];
	/**
	 * Infinite scroll top most week offset
	 */
	dataOffsetTop: number;
	/**
	 * Infinite scroll bottom most week offset
	 */
	dataOffsetBottom: number;
	/**
	 * Today as moment.js object
	 */
	today: Moment;
	/**
	 * The selected filter value
	 */
	filterValue: string | null;
}

class ScrollableSchedule extends PureComponent<
	ScrollableScheduleProps,
	IState
> {
	public todayElem: HTMLElement | null = null;
	public scrollElem: InfiniteScroll | null = null;

	constructor(props: ScrollableScheduleProps) {
		super(props);

		this.state = this.getDefaultState();
	}

	componentDidMount() {
		i18n.on("languageChanged", this.onLanguageChanged);
	}

	componentWillUnmount() {
		i18n.off("languageChanged", this.onLanguageChanged);
	}

	getDefaultState = () => ({
		items: [],
		dataOffsetTop: -1,
		dataOffsetBottom: 0,
		today: moment(),
		filterValue: this.props.filter?.defaultValue ?? null,
	});

	render() {
		return (
			<Grid container>
				<Grid
					item
					xs={12}
					className={this.props.classes.today}
					onClick={this.jumpToToday}
				>
					<Grid container justify={"space-between"}>
						<Grid item>
							<Button
								className={this.props.classes.todayBtn}
								onClick={this.jumpToToday}
								fullWidth
							>
								<Box m={2}>{this.state.today.format("ddd DD MMMM")}</Box>
							</Button>
						</Grid>
						<Grid item>
							{this.props.filter && (
								<Box px={2} className={this.props.classes.filterWrapper}>
									<select
										onClick={this.preventAction}
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
				<Grid item xs={12}>
					<InfiniteScroll
						className={combineClassNames([
							this.props.wrapperClass,
							this.props.classes.scroller,
						])}
						loadMoreTop={this.loadMoreTop}
						loadMoreBottom={this.loadMoreBottom}
						ref={this.setScrollElemRef}
					>
						<Box m={2}>
							<Grid container spacing={2}>
								{this.state.items}
							</Grid>
						</Box>
					</InfiniteScroll>
				</Grid>
			</Grid>
		);
	}

	/**
	 * Loads more data on top of the scroller
	 */
	loadMoreTop = () => this.loadMore(true);
	/**
	 * Loads more data at the bottom of the scroller
	 */
	loadMoreBottom = () => this.loadMore(false);
	/**
	 * Sets the scroller reference to control scrolling
	 * @param elem The scroller element
	 */
	setScrollElemRef = (elem: InfiniteScroll | null) => (this.scrollElem = elem);

	/**
	 * Loads more data in the infinite scroll
	 * @param top load more data on top? (if false loads more data at bottom)
	 */
	loadMore = (top: boolean) => {
		const page = top ? this.state.dataOffsetTop : this.state.dataOffsetBottom;
		const item = (
			<ScrollableScheduleWeek
				key={page.toString()}
				loadData={() =>
					this.props.loadWeekCallback(page, this.state.filterValue)
				}
				setTodayElement={(elem: HTMLElement | null) => (this.todayElem = elem)}
				moment={this.state.today.clone().add(page - 1, "weeks")}
			/>
		);
		if (top) {
			this.setState((prevState) => ({
				items: [item, ...prevState.items],
				dataOffsetTop: prevState.dataOffsetTop - 1,
			}));
		} else {
			this.setState((prevState) => ({
				items: [...prevState.items, item],
				dataOffsetBottom: prevState.dataOffsetBottom + 1,
			}));
		}
	};

	jumpToToday = () => {
		if (!this.todayElem || !this.scrollElem || !this.scrollElem.wrapper) {
			return;
		}

		this.scrollElem.wrapper.scrollTop = this.todayElem.offsetTop;
	};

	preventAction = (evt: React.MouseEvent) => {
		evt.stopPropagation();
	};

	handleFilterSelect = (evt: React.ChangeEvent<HTMLSelectElement>) => {
		this.setState({
			...this.getDefaultState(),
			filterValue: evt.target.value,
		});
	};

	onLanguageChanged = () => this.setState(this.getDefaultState());
}

const styles = createStyles((theme: Theme) => ({
	today: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main),
		borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
	},
	todayBtn: {
		textTransform: "none",
		textAlign: "left",
		color: "inherit",
		display: "block",
	},
	scroller: {
		overflow: "auto",
		borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
		position: "relative",
	},
	filterWrapper: {
		top: "50%",
		position: "relative",
		transform: "translateY(-50%)",
	},
	filterSelect: {
		backgroundColor: "transparent",
		border: "none",
		color: theme.palette.getContrastText(theme.palette.primary.main),
		cursor: "pointer",
	},
}));

export default withStyles(styles)(ScrollableSchedule);
