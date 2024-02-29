import React from "react";
import { Button, Grid } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";
import makeStyles from "@mui/styles/makeStyles";
import combineColors from "../../../utils/combineColors";

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

export interface ScheduleFilterDefinitionSelect {
	type: "select";
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

export interface ScheduleFilterDefinitionSwitch {
	type: "checkbox";
	/**
	 * Default filter value
	 */
	defaultValue: boolean;
	/**
	 * Change handler
	 * @param newFilter the new filter value
	 * @remarks Use to persist filter value
	 */
	onChange?: (newFilter: boolean) => void;
	/**
	 * Label of the filter
	 */
	label: string;
}

export type ScheduleFilterDefinition =
	| ScheduleFilterDefinitionSelect
	| ScheduleFilterDefinitionSwitch;

export interface ScheduleAction {
	/**
	 * unique identifier for action
	 */
	id: string;
	/**
	 * The button label
	 */
	label: string;
	/**
	 * The click handler
	 */
	onClick: () => void;
	/**
	 * Is the button disabled?
	 */
	disabled?: boolean;
}

export interface DayContentsProps {
	data: IDayData[];
	altBorder?: boolean; // alternative border color, to maintain contrast to background
}

// @deprecated use DayContentsProps
export type IProps = DayContentsProps;

const useStyles = makeStyles(
	(theme) => ({
		btn: {
			textTransform: "none",
			textAlign: "left",
			color: "inherit",
			display: "block",
		},
		btnAltBorder: {
			borderColor: `rgba(${combineColors(
				theme.palette.background.paper,
				theme.palette.action.hover,
			).join()})`,
			"&:hover": {
				borderColor: theme.palette.background.paper,
			},
		},
		btnDisabled: {
			cursor: "default",
		},
	}),
	{ name: "CcDayContents" },
);

const DayContents = (props: DayContentsProps) => {
	const { data, altBorder } = props;
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
							altBorder && classes.btnAltBorder,
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
