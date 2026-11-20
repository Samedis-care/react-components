import React from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import DayContents, { IDayData } from "../Common/DayContents";
import { Moment } from "moment";

export interface ScrollableScheduleDayProps {
	moment: Moment;
	/**
	 * Marks the row as today's: the root gets the class
	 * `CcScrollableScheduleDay-today` and `aria-current="date"`. By default
	 * the row then has a bar in the primary color on its left edge and its
	 * date label is bold. Default false
	 */
	today?: boolean;
	data: IDayData[];
}

/** width of the bar that marks today's row, in px */
const TODAY_BAR_WIDTH = 4;

const Root = styled("div", {
	name: "CcScrollableScheduleDay",
	slot: "root",
})(({ theme }) => ({
	margin: theme.spacing(0, -2),
	paddingLeft: theme.spacing(1),
	"&.CcScrollableScheduleDay-today": {
		// a border, not only a color, so the mark stays in forced-colors mode;
		// the padding shrinks by its width, so the label stays in line
		borderLeft: `${TODAY_BAR_WIDTH}px solid ${theme.palette.primary.main}`,
		paddingLeft: `calc(${theme.spacing(1)} - ${TODAY_BAR_WIDTH}px)`,
		fontWeight: theme.typography.fontWeightBold,
	},
}));

/**
 * Slots of CcScrollableScheduleDay: `root` is the day row. Today's row also
 * has the class `CcScrollableScheduleDay-today`, for a theme to style it with
 * `root: { "&.CcScrollableScheduleDay-today": { … } }`.
 */
export type ScrollableScheduleDayClassKey = "root";

const ScrollableScheduleDay = React.forwardRef(function ScrollableScheduleDay(
	inProps: ScrollableScheduleDayProps,
	ref: React.ForwardedRef<HTMLDivElement>,
) {
	const props = useThemeProps({
		props: inProps,
		name: "CcScrollableScheduleDay",
	});
	return (
		<Grid size={12}>
			<Root
				className={props.today ? "CcScrollableScheduleDay-today" : undefined}
				aria-current={props.today ? "date" : undefined}
			>
				<Grid container spacing={2}>
					<Grid ref={ref} size={1}>
						{props.moment.format("DD ddd")}
					</Grid>
					<Grid size={11}>
						<DayContents data={props.data} />
					</Grid>
				</Grid>
			</Root>
		</Grid>
	);
});

export default React.memo(ScrollableScheduleDay);
