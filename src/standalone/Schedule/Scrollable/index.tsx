import React, { Component } from "react";
import {
	Grid,
	WithStyles,
	withStyles,
	Typography,
	Box,
} from "@material-ui/core";
import moment, { Moment } from "moment";
import ScrollableScheduleWeek from "./ScrollableScheduleWeek";
import InfiniteScroll from "../../InfiniteScroll";

type IProps = WithStyles;

interface IState {
	items: JSX.Element[];
	dataOffsetTop: number;
	dataOffsetBottom: number;
	today: Moment;
}

class ScrollableSchedule extends Component<IProps, IState> {
	public todayElem: HTMLElement | null = null;
	public scrollElem: InfiniteScroll | null = null;

	constructor(props: IProps) {
		super(props);

		this.state = this.getDefaultState();
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
					<Box m={2}>
						<Typography>{this.state.today.format("ddd DD MMMM")}</Typography>
					</Box>
				</Grid>
				<Grid item xs={12}>
					<InfiniteScroll
						className={this.props.classes.wrapper}
						loadMoreTop={() => this.loadMore(true)}
						loadMoreBottom={() => this.loadMore(false)}
						ref={(elem) => (this.scrollElem = elem)}
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

	loadMore = (top: boolean) => {
		const page = top ? this.state.dataOffsetTop : this.state.dataOffsetBottom;
		const item = (
			<ScrollableScheduleWeek
				key={page.toString()}
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
}

export default withStyles((theme) => ({
	wrapper: {
		height: "100%",
		overflow: "auto",
	},
	today: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main),
	},
}))(ScrollableSchedule);
