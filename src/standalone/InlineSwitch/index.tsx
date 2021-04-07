import React, { useCallback } from "react";
import { Grid, Typography, withStyles, Theme, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export interface InlineSwitchProps {
	/**
	 * Value for switch position
	 */
	value: boolean;
	/**
	 * Set value for switch position
	 * @param checked The value of switch input
	 */
	onChange?: (checked: boolean) => void;
	/**
	 * Display switch control?
	 */
	visible: boolean;
	/**
	 * Label for switch control (only used if visible is truthy)
	 */
	label?: React.ReactNode;
	children?: React.ReactElement;
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
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

const InlineSwitch = (props: InlineSwitchProps) => {
	const classes = useStyles(props);
	const { label, value, onChange, visible, children } = props;

	const handleSwitchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (onChange) onChange(event.target.checked);
		},
		[onChange]
	);

	return (
		<Typography component="div" className={classes.labelWithSwitch}>
			{visible && (
				<Typography
					component="div"
					className={classes.switch}
					variant={"caption"}
				>
					<Grid component="label" container alignItems="center" spacing={1}>
						<Grid item>
							<AntSwitch checked={value} onChange={handleSwitchChange} />
						</Grid>
						<Grid item>{label}</Grid>
					</Grid>
				</Typography>
			)}
			<Typography component="div">{children}</Typography>
		</Typography>
	);
};

export default React.memo(InlineSwitch) as typeof InlineSwitch;
