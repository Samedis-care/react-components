import React from "react";
import { Button, ButtonProps, Tooltip, withStyles } from "@material-ui/core";
import { Theme } from "@material-ui/core/styles";
import { combineColors } from "../../utils";

const StyledButton = withStyles((theme: Theme) => ({
	root: (props: SubActionButtonProps) => ({
		backgroundColor: theme.palette.background.default,
		color: theme.palette.text.primary,
		textTransform: "unset",
		"&:hover": {
			backgroundColor: `rgba(${combineColors(
				theme.palette.primary.main,
				theme.palette.action.hover
			).join()})`,
		},
		"&.Mui-disabled": {
			color: theme.palette.text.disabled,
		},
		minWidth: props.small ? "unset" : undefined,
		padding: props.small ? 5 : undefined,
	}),
	outlined: (props: SubActionButtonProps) => ({
		"&:hover": {
			borderColor: "transparent",
		},
		"& svg": {
			fill: theme.palette.primary.main,
			marginRight: props.small ? undefined : 15,
		},
		"&:hover svg": {
			fill: theme.palette.text.primary,
		},
		borderRadius: 0,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderBottomWidth: props.small ? undefined : 0,
		"&:first-child": {
			borderLeftWidth: props.small ? 1 : undefined,
			borderTopWidth: props.small ? undefined : 0,
		},
		"&:last-child": {
			borderRightWidth: props.small ? 1 : undefined,
		},
		"&.Mui-disabled": {
			"& svg": {
				fill: theme.palette.text.disabled,
			},
			borderRadiusWidth: 0,
			borderLeftWidth: 0,
			borderRightWidth: 0,
			color: theme.palette.text.disabled,
			borderBottomWidth: props.small ? undefined : 0,
			"&:first-child": {
				borderLeftWidth: props.small ? 1 : undefined,
				borderTopWidth: props.small ? undefined : 0,
			},
			"&:last-child": {
				borderRightWidth: props.small ? 1 : undefined,
			},
		},
		padding: props.small ? 10 : "10px 30px",
	}),
	label: {
		justifyContent: "flex-start",
	},
}))(Button);

export interface SubActionButtonProps extends Omit<ButtonProps, "children"> {
	/**
	 * The icon of the button
	 */
	icon?: React.ReactNode;
	/**
	 * Show the compact version of the button (only icon)
	 */
	small?: boolean;
	/**
	 * The text of the button (used for tooltip if small is true)
	 */
	children: NonNullable<React.ReactNode>;
}

const SubActionButton = (props: SubActionButtonProps) => {
	const { icon, small, children } = props;

	const renderButton = (): React.ReactElement => (
		<StyledButton variant={"outlined"} fullWidth={!small} {...props}>
			{icon} {!small && children}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={children}>{renderButton()}</Tooltip>;
};

export default React.memo(SubActionButton);
