import React, { PureComponent } from "react";
import {
	Button,
	createStyles,
	Grid,
	WithStyles,
	withStyles,
} from "@material-ui/core";
import { combineClassNames } from "../../../utils";

export interface IDayData {
	/**
	 * Unique identifier
	 */
	id: string;
	/**
	 * The text/title to display
	 */
	title: React.ReactNode;
	/**
	 * Optional left click handler
	 */
	onClick?: React.MouseEventHandler;
	/**
	 * Optional middle click handler
	 */
	onAuxClick?: React.MouseEventHandler;
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
							className={combineClassNames([
								this.props.classes.btn,
								!entry.onClick &&
									!entry.onAuxClick &&
									this.props.classes.btnDisabled,
							])}
							onClick={entry.onClick}
							onAuxClick={entry.onAuxClick}
							disableRipple={!entry.onClick && !entry.onAuxClick}
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
	btnDisabled: {
		cursor: "default",
	},
});

export default withStyles(styles)(DayContents);
