import React, { PureComponent } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import DayContents, { IDayData } from "../Common/DayContents";
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import moment, { Moment } from "moment";
import { combineClassNames } from "../../../utils";

export interface IProps extends WithStyles {
	/**
	 * The day offset
	 */
	dayIdx: number; // 0 - 6
	/**
	 * The day this component represents
	 */
	day: Moment;
	/**
	 * The date label
	 */
	date: string;
	/**
	 * The contents of the day
	 */
	data: IDayData[];
}

class WeekViewDay extends PureComponent<IProps> {
	render() {
		const isFirst = this.props.dayIdx === 0;
		const isLast = this.props.dayIdx === 6;
		const isToday =
			this.props.day.dayOfYear() === moment().dayOfYear() &&
			this.props.day.year() === moment().year();

		return (
			<Grid item xs>
				<Paper
					square
					elevation={0}
					className={combineClassNames([
						isToday && this.props.classes.today,
						this.props.classes.paper,
						isFirst && this.props.classes.first,
						isLast && this.props.classes.last,
					])}
				>
					<Grid container>
						<Grid item xs={12}>
							<Typography align={"center"}>
								{this.props.day.format("dddd")}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Divider />
						</Grid>
						<Grid item xs={12}>
							<Box m={1}>{this.props.date}</Box>
						</Grid>
						<Grid item xs={12}>
							<Box m={1}>
								<DayContents data={this.props.data} />
							</Box>
						</Grid>
					</Grid>
				</Paper>
			</Grid>
		);
	}
}

const styles = createStyles((theme: Theme) => ({
	paper: {
		height: "100%",
	},
	today: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main),
	},
	first: {
		borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
	},
	last: {
		borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
	},
}));

export default withStyles(styles)(WeekViewDay);
