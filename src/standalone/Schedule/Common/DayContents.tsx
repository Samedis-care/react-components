import React, { PureComponent } from "react";
import {
	Button,
	createStyles,
	Grid,
	WithStyles,
	withStyles,
} from "@material-ui/core";

export interface IDayData {
	id: string;
	title: string;
	onClick?: () => void;
}

export interface IProps extends WithStyles {
	data: IDayData[];
}

class DayContents extends PureComponent<IProps> {
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

const styles = createStyles({
	btn: {
		textTransform: "none",
		textAlign: "left",
		color: "inherit",
		display: "block",
	},
});

export default withStyles(styles)(DayContents);
