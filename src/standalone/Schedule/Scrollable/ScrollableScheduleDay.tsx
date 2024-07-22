import React from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import DayContents, { IDayData } from "../Common/DayContents";
import { Moment } from "moment";

export interface ScrollableScheduleDayProps {
	moment: Moment;
	today?: boolean;
	data: IDayData[];
}

const Root = styled(Grid, {
	name: "CcScrollableScheduleDay",
	slot: "root",
})({});

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
		<Root
			item
			xs={12}
			container
			spacing={2}
			className={props.today ? "CcScrollableScheduleDay-today" : undefined}
		>
			<Grid item xs={1} ref={ref}>
				{props.moment.format("DD ddd")}
			</Grid>
			<Grid item xs={11}>
				<DayContents data={props.data} />
			</Grid>
		</Root>
	);
});

export default React.memo(ScrollableScheduleDay);
