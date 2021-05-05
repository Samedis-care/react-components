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
import { IDayData } from "../Common/DayContents";
import i18n from "../../../i18n";
import { combineClassNames } from "../../../utils";

/**
 * Callback to load week data from a data source
 * @param weekOffset The week relative to the current week of year
 * 					 Example: -1 for last week, 0 for this week, 1 for next week
 * @returns A promise containing the data for the days of the week, may throw an
 * 			error. Format: IDayData[weekday starting Monday][n]
 */
export type LoadWeekCallback = (
	weekOffset: number
) => IDayData[][] | Promise<IDayData[][]>;

export interface IProps extends WithStyles {
	/**
	 * CSS Class which specifies the infinite scroll height
	 */
	wrapperClass: string;
	/**
	 * The callback to load data for a week
	 */
	loadWeekCallback: LoadWeekCallback;
}

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
}

class ScrollableSchedule extends PureComponent<IProps, IState> {
	public todayElem: HTMLElement | null = null;
	public scrollElem: InfiniteScroll | null = null;

	constructor(props: IProps) {
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
					<Button
						className={this.props.classes.todayBtn}
						onClick={this.jumpToToday}
						fullWidth
					>
						<Box m={2}>{this.state.today.format("ddd DD MMMM")}</Box>
					</Button>
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
				loadData={() => this.props.loadWeekCallback(page)}
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

		this.scrollElem.wrapper.scrollTop =
			this.todayElem.offsetTop - this.todayElem.clientHeight - 20;
	};

	onLanguageChanged = () => this.setState(this.getDefaultState());
}

const styles = createStyles((theme: Theme) => ({
	today: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main),
	},
	todayBtn: {
		textTransform: "none",
		textAlign: "left",
		color: "inherit",
		display: "block",
	},
	scroller: {
		overflow: "auto",
	},
}));

export default withStyles(styles)(ScrollableSchedule);
