import React from "react";
import { Button, Grid2 as Grid, styled, useThemeProps } from "@mui/material";
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
	/**
	 * the data to display
	 */
	data: IDayData[];
	/**
	 * alternative border color, to maintain contrast to background
	 */
	altBorder?: boolean;
	/**
	 * css class to apply to root
	 */
	className?: string;
	/**
	 * custom CSS classes
	 */
	classes?: Partial<Record<DayContentsClassKey, string>>;
}

// @deprecated use DayContentsProps
export type IProps = DayContentsProps;

export interface DayContentsButtonOwnerState {
	altBorder: boolean;
	unClickable: boolean;
}
const StyledButton = styled(Button, { name: "CcDayContents", slot: "button" })<{
	ownerState: DayContentsButtonOwnerState;
}>(({ theme, ownerState: { altBorder, unClickable } }) => ({
	textTransform: "none",
	textAlign: "left",
	color: "inherit",
	display: "block",
	...(altBorder && {
		borderColor: `rgba(${combineColors(
			theme.palette.background.paper,
			theme.palette.action.hover,
		).join()})`,
		"&:hover": {
			borderColor: theme.palette.background.paper,
		},
	}),
	...(unClickable && {
		cursor: "default",
	}),
}));

export type DayContentsClassKey = "button";

const DayContents = (inProps: DayContentsProps) => {
	const props = useThemeProps({ props: inProps, name: "CcDayContents" });
	const { data, altBorder, className, classes } = props;
	return (
		<Grid container spacing={2} className={className}>
			{data.map((entry) => (
				<Grid key={entry.id} size={12}>
					<StyledButton
						variant={"outlined"}
						size={"small"}
						fullWidth
						ownerState={{
							altBorder: !!altBorder,
							unClickable: !entry.onClick && !entry.onAuxClick,
						}}
						className={classes?.button}
						onClick={entry.onClick}
						onAuxClick={entry.onAuxClick}
						disableRipple={!entry.onClick && !entry.onAuxClick}
					>
						{entry.title}
					</StyledButton>
				</Grid>
			))}
		</Grid>
	);
};

export default React.memo(DayContents);
