import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DayContents, { IDayData } from "../Common/DayContents";
import { styled, useThemeProps } from "@mui/material";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import moment, { Moment } from "moment";
import combineClassNames from "../../../utils/combineClassNames";

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
	/**
	 * class name to apply to root
	 */
	className?: string;
	/**
	 * custom CSS classes
	 */
	classes?: Partial<Record<WeekViewDayClassKey, string>>;
}

const StyledPaper = styled(Paper, { name: "CcWeekViewDay", slot: "paper" })(
	({ theme }) => ({
		height: "100%",
		"&.CcWeekViewDay-today": {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
		},
		"&.CcWeekViewDay-first": {
			borderRadius: `0 0 0 ${theme.shape.borderRadius}px`,
		},
		"&.CcWeekViewDay-last": {
			borderRadius: `0 0 ${theme.shape.borderRadius}px 0`,
		},
	}),
);

const DayContentsWrapper = styled(Grid, {
	name: "CcWeekViewDay",
	slot: "dayContents",
})({
	minHeight: 150,
});

export type WeekViewDayClassKey = "paper" | "dayContents";

const WeekViewDay = (inProps: WeekViewDayProps) => {
	const props = useThemeProps({ props: inProps, name: "CcWeekViewDay" });
	const { dayIdx, day, date, data, className, classes } = props;
	const isFirst = dayIdx === 0;
	const isLast = dayIdx === 6;
	const isToday =
		day.dayOfYear() === moment().dayOfYear() && day.year() === moment().year();

	return (
		<Grid item xs className={className}>
			<StyledPaper
				square
				elevation={0}
				className={combineClassNames([
					classes?.paper,
					isToday && "CcWeekViewDay-today",
					isFirst && "CcWeekViewDay-first",
					isLast && "CcWeekViewDay-last",
				])}
			>
				<Grid container>
					<Grid item xs={12}>
						<Typography align={"center"}>{day.format("dddd")}</Typography>
					</Grid>
					<Grid item xs={12}>
						<Divider />
					</Grid>
					<Grid item xs={12}>
						<Box m={1}>{date}</Box>
					</Grid>
					<DayContentsWrapper item xs={12} className={classes?.dayContents}>
						<Box m={1}>
							<DayContents data={data} altBorder={isToday} />
						</Box>
					</DayContentsWrapper>
				</Grid>
			</StyledPaper>
		</Grid>
	);
};

export default React.memo(WeekViewDay);
