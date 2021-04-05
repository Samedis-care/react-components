import React, { useCallback } from "react";
import { Grid, Typography, withStyles, Theme, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export interface InlineSwitch {
	/**
	 * Value for switch position
	 */
	switchValue: boolean;
	/**
	 * Set value for switch position
	 */
	setSwitchValue: (checked: boolean) => void;
	/**
	 * Display switch control?
	 */
	displaySwitch: boolean;
	/**
	 * Label for switch control (only used if displaySwitch is truthy)
	 */
	switchLabel?: React.ReactNode;
	children?: React.ReactElement;
	/**
	 * Apply custom margin top class to set UI
	 */
	customMarginTop?: boolean;
}

const useStyles = makeStyles(
	{
		switch: {
			lineHeight: "30px",
			float: "right",
		},
		labelWithSwitch: {
			marginTop: 15,
		},
		customMarginTop: {
			marginTop: -30,
		},
	},
	{ name: "InlineSwitch" }
);

const AntSwitch = withStyles((theme: Theme) => ({
	root: {
		width: 35,
		height: 16,
		padding: 0,
		display: "flex",
	},
	switchBase: {
		padding: 2,
		color: theme.palette.grey[500],
		"&$checked": {
			transform: "translateX(18px)",
			color: theme.palette.common.white,
			"& + $track": {
				opacity: 1,
				backgroundColor: theme.palette.primary.main,
				borderColor: theme.palette.primary.main,
			},
		},
	},
	thumb: {
		width: 12,
		height: 12,
		boxShadow: "none",
	},
	track: {
		border: `1px solid ${theme.palette.grey[500]}`,
		borderRadius: 16 / 2,
		opacity: 1,
		backgroundColor: theme.palette.common.white,
	},
	checked: {},
}))(Switch);

const InlineSwitch = (props: InlineSwitch) => {
	const classes = useStyles();
	const {
		switchLabel,
		switchValue,
		setSwitchValue,
		displaySwitch,
		children,
		customMarginTop,
	} = props;

	const handleSwitchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (setSwitchValue) setSwitchValue(event.target.checked);
		},
		[setSwitchValue]
	);

	return (
		<Typography component="div" className={classes.labelWithSwitch}>
			{displaySwitch && (
				<Typography
					component="div"
					className={`${classes.switch} ${
						customMarginTop ? classes.customMarginTop : ""
					}`}
					variant={"caption"}
				>
					<Grid component="label" container alignItems="center" spacing={1}>
						<Grid item>
							<AntSwitch checked={switchValue} onChange={handleSwitchChange} />
						</Grid>
						<Grid item>{switchLabel}</Grid>
					</Grid>
				</Typography>
			)}
			<Typography component="div">{children}</Typography>
		</Typography>
	);
};

export default React.memo(InlineSwitch) as typeof InlineSwitch;
