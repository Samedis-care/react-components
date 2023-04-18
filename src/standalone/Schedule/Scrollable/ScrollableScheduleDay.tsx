import React, { PureComponent } from "react";
import { Grid } from "@mui/material";
import DayContents, { IDayData } from "../Common/DayContents";
import { Moment } from "moment";

export interface IProps {
	refFwd?: (elem: HTMLElement | null) => void;
	moment: Moment;
	data: IDayData[];
}

class ScrollableScheduleDay extends PureComponent<IProps> {
	render(): React.ReactElement {
		return (
			<>
				<Grid item xs={1} ref={this.props.refFwd}>
					{this.props.moment.format("DD ddd")}
				</Grid>
				<Grid item xs={11}>
					<DayContents data={this.props.data} />
				</Grid>
			</>
		);
	}
}

export default ScrollableScheduleDay;
