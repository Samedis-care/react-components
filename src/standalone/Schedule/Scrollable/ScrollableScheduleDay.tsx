import React, { useId } from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import DayContents, { IDayData } from "../Common/DayContents";
import { Moment } from "moment";
import visuallyHidden from "../../../utils/internal/visuallyHidden";

export interface ScrollableScheduleDayProps {
	/**
	 * The day of the row, formatted in its own locale: the label shows
	 * "DD ddd", and the row is a group named by the full date, "dddd, LL"
	 * ("Wednesday, October 14, 2026" in en)
	 */
	moment: Moment;
	/**
	 * Marks the row as today's: the root gets the class
	 * `CcScrollableScheduleDay-today` and `aria-current="date"`. By default
	 * the row then has a bar in the primary color on its left edge and its
	 * date label is bold. Default false
	 */
	today?: boolean;
	/**
	 * The day's entries, in display order
	 */
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

const Label = styled(Grid, {
	name: "CcScrollableScheduleDay",
	slot: "label",
})({
	// keeps the visually hidden full date in the label's own box, not at the
	// top of the scroll container: a screen reader that brings the date into
	// view then does not scroll the list away from the day
	position: "relative",
});

const FullDate = styled("span", {
	name: "CcScrollableScheduleDay",
	slot: "fullDate",
})(visuallyHidden);

/**
 * Slots of CcScrollableScheduleDay: `root` is the day row, `label` the cell
 * with its date label and `fullDate` the full date inside it, which is
 * visually hidden and names the row for assistive technology. Today's row also
 * has the class `CcScrollableScheduleDay-today`, for a theme to style it with
 * `root: { "&.CcScrollableScheduleDay-today": { … } }`.
 */
export type ScrollableScheduleDayClassKey = "root" | "label" | "fullDate";

/**
 * One day row of ScrollableSchedule: the date label ("DD ddd") and the day's
 * entries. The row is a group named by the full date, so a screen reader names
 * the day and its date when focus moves into it. The short label is hidden
 * from assistive technology, which reads the visually hidden full date in its
 * place. The forwarded ref is the label cell.
 */
const ScrollableScheduleDay = React.forwardRef(function ScrollableScheduleDay(
	inProps: ScrollableScheduleDayProps,
	ref: React.ForwardedRef<HTMLDivElement>,
) {
	const props = useThemeProps({
		props: inProps,
		name: "CcScrollableScheduleDay",
	});
	const labelId = useId();
	return (
		<Grid size={12}>
			<Root
				role="group"
				aria-labelledby={labelId}
				className={props.today ? "CcScrollableScheduleDay-today" : undefined}
				aria-current={props.today ? "date" : undefined}
			>
				<Grid container spacing={2}>
					<Label ref={ref} size={1} id={labelId}>
						<span aria-hidden>{props.moment.format("DD ddd")}</span>
						<FullDate>{props.moment.format("dddd, LL")}</FullDate>
					</Label>
					<Grid size={11}>
						<DayContents data={props.data} />
					</Grid>
				</Grid>
			</Root>
		</Grid>
	);
});

export default React.memo(ScrollableScheduleDay);
