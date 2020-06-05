import React, { Component } from "react";
import { Button, Grid, WithStyles, withStyles } from "@material-ui/core";

export interface IDayData {
	id: string;
	title: string;
	onClick: () => void;
}

interface IProps extends WithStyles {
	data: IDayData[];
}

class DayContents extends Component<IProps> {
	render() {
		return (
			<Grid container spacing={2}>
				{this.props.data.map((entry) => (
					<Grid item xs={12} key={entry.id}>
						<Button
							variant={"outlined"}
							size={"small"}
							fullWidth
							className={this.props.classes.btn}
							onClick={entry.onClick}
						>
							{entry.title}
						</Button>
					</Grid>
				))}
			</Grid>
		);
	}
}

export default withStyles(() => ({
	btn: {
		textTransform: "none",
		textAlign: "left",
		color: "inherit",
		display: "block",
	},
}))(DayContents);
