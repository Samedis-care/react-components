import React from "react";
import { Button, Grid } from "@mui/material";
import { combineClassNames } from "../../../utils";
import makeStyles from "@mui/styles/makeStyles";

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

export interface ScheduleFilterDefinition {
	/**
	 * Filter options (value -> label)
	 */
	options: Record<string, string>;
	/**
	 * Default filter value
	 */
	defaultValue: string;
	/**
	 * Change handler
	 * @param newFilter the new selected filter
	 * @remarks Use to persist filter value
	 */
	onChange?: (newFilter: string) => void;
}

export interface DayContentsProps {
	data: IDayData[];
}

// @deprecated use DayContentsProps
export type IProps = DayContentsProps;

const useStyles = makeStyles(
	{
		btn: {
			textTransform: "none",
			textAlign: "left",
			color: "inherit",
			display: "block",
		},
		btnDisabled: {
			cursor: "default",
		},
	},
	{ name: "CcDayContents" }
);

const DayContents = (props: DayContentsProps) => {
	const { data } = props;
	const classes = useStyles();
	return (
		<Grid container spacing={2}>
			{data.map((entry) => (
				<Grid item xs={12} key={entry.id}>
					<Button
						variant={"outlined"}
						size={"small"}
						fullWidth
						className={combineClassNames([
							classes.btn,
							!entry.onClick && !entry.onAuxClick && classes.btnDisabled,
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
};

export default React.memo(DayContents);
