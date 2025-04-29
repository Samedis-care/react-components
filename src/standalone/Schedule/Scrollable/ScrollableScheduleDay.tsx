import React from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import DayContents, { IDayData } from "../Common/DayContents";
import { Moment } from "moment";

export interface ScrollableScheduleDayProps {
	moment: Moment;
	today?: boolean;
	data: IDayData[];
}

const Root = styled("div", {
	name: "CcScrollableScheduleDay",
	slot: "root",
})(({ theme }) => ({
	margin: theme.spacing(0, -2),
	paddingLeft: theme.spacing(1),
}));

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
