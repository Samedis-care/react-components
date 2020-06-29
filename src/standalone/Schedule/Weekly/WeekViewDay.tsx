import React, { PureComponent } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import DayContents, { IDayData } from "../Common/DayContents";
import { WithStyles, withStyles } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import moment, { Moment } from "moment";

export interface IProps extends WithStyles {
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
		const isToday =
			this.props.day.dayOfYear() === moment().dayOfYear() &&
			this.props.day.year() === moment().year();

		return (
			<Grid item xs>
				<Paper
					square
					className={
						isToday ? this.props.classes.paperToday : this.props.classes.paper
					}
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

export default withStyles((theme) => ({
	paper: {
		height: "100%",
	},
	paperToday: {
		height: "100%",
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main),
	},
}))(WeekViewDay);
