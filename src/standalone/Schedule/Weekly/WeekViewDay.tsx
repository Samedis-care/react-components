import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DayContents, { IDayData } from "../Common/DayContents";
import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import moment, { Moment } from "moment";
import { combineClassNames } from "../../../utils";

export interface WeekViewDayProps {
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

const useStyles = makeStyles(
	(theme: Theme) => ({
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
	}),
	{ name: "CcWeekViewDay" }
);

const WeekViewDay = (props: WeekViewDayProps) => {
	const classes = useStyles();
	const isFirst = props.dayIdx === 0;
	const isLast = props.dayIdx === 6;
	const isToday =
		props.day.dayOfYear() === moment().dayOfYear() &&
		props.day.year() === moment().year();

	return (
		<Grid item xs>
			<Paper
				square
				elevation={0}
				className={combineClassNames([
					isToday && classes.today,
					classes.paper,
					isFirst && classes.first,
					isLast && classes.last,
				])}
			>
				<Grid container>
					<Grid item xs={12}>
						<Typography align={"center"}>{props.day.format("dddd")}</Typography>
					</Grid>
					<Grid item xs={12}>
						<Divider />
					</Grid>
					<Grid item xs={12}>
						<Box m={1}>{props.date}</Box>
					</Grid>
					<Grid item xs={12}>
						<Box m={1}>
							<DayContents data={props.data} />
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Grid>
	);
};

export default React.memo(WeekViewDay);
