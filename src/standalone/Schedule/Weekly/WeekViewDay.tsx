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

/** thickness of the bar on the top edge of today's column, in px */
const TODAY_BAR_THICKNESS = 4;

const StyledPaper = styled(Paper, { name: "CcWeekViewDay", slot: "paper" })(
	({ theme }) => ({
		height: "100%",
		"&.CcWeekViewDay-today": {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
			// not a color only, so the mark stays in forced-colors mode, which
			// replaces the background: bold labels and a bar on the top edge.
			// The bar is a border (forced colors keep borders) on an overlay, so
			// the column's labels stay in line with the other columns' labels.
			position: "relative",
			fontWeight: theme.typography.fontWeightBold,
			"& .CcWeekViewDay-weekday": {
				fontWeight: "inherit",
			},
			"&::before": {
				content: '""',
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				borderTop: `${TODAY_BAR_THICKNESS}px solid ${theme.palette.primary.main}`,
				pointerEvents: "none",
			},
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

/**
 * Slots of CcWeekViewDay: `paper` is the column's Paper and carries the state
 * classes `CcWeekViewDay-today`, `CcWeekViewDay-first` and
 * `CcWeekViewDay-last`; `dayContents` is the entry area (min-height 150px).
 *
 * Today's column (`CcWeekViewDay-today`, also `aria-current="date"`) has by
 * default a primary background, a bar in the primary color on its top edge
 * (its `::before`) and a bold weekday (`.CcWeekViewDay-weekday`, which
 * inherits the column's weight) and date. A theme restyles it under
 * `paper: { "&.CcWeekViewDay-today": { … } }`; keep a mark that is not a
 * color only, as forced-colors mode replaces the background.
 */
export type WeekViewDayClassKey = "paper" | "dayContents";

const WeekViewDay = (inProps: WeekViewDayProps) => {
	const props = useThemeProps({ props: inProps, name: "CcWeekViewDay" });
	const { dayIdx, day, date, data, className, classes } = props;
	const isFirst = dayIdx === 0;
	const isLast = dayIdx === 6;
	const isToday =
		day.dayOfYear() === moment().dayOfYear() && day.year() === moment().year();

	return (
		<Grid className={className} size="grow">
			<StyledPaper
				square
				elevation={0}
				className={combineClassNames([
					classes?.paper,
					isToday && "CcWeekViewDay-today",
					isFirst && "CcWeekViewDay-first",
					isLast && "CcWeekViewDay-last",
				])}
				aria-current={isToday ? "date" : undefined}
			>
				<Grid container>
					<Grid size={12}>
						<Typography align={"center"} className={"CcWeekViewDay-weekday"}>
							{day.format("dddd")}
						</Typography>
					</Grid>
					<Grid size={12}>
						<Divider />
					</Grid>
					<Grid size={12}>
						<Box sx={{ m: 1 }}>{date}</Box>
					</Grid>
					<DayContentsWrapper size={12} className={classes?.dayContents}>
						<Box sx={{ m: 1 }}>
							<DayContents data={data} altBorder={isToday} />
						</Box>
					</DayContentsWrapper>
				</Grid>
			</StyledPaper>
		</Grid>
	);
};

export default React.memo(WeekViewDay);
