import React from "react";
import { Button, ButtonProps, Tooltip, withStyles } from "@material-ui/core";
import { Theme } from "@material-ui/core/styles";
import { combineColors } from "../../utils";

const StyledButton = withStyles((theme: Theme) => ({
	root: (props: ActionButtonProps) => ({
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		textTransform: "unset",
		"&:hover": {
			backgroundColor: `rgba(${combineColors(
				theme.palette.primary.main,
				theme.palette.action.hover
			).join()})`,
		},
		"&.Mui-disabled": {
			backgroundColor: theme.palette.action.disabled,
		},
		minWidth: props.small ? "unset" : undefined,
		padding: props.small ? 5 : undefined,
	}),
	outlined: (props: ActionButtonProps) => ({
		borderRadius: 25,
		"&.Mui-disabled": {
			color: theme.palette.background.paper,
		},
		padding: props.small ? 5 : undefined,
	}),
	label: {
		justifyContent: "flex-start",
	},
}))(Button);

export interface ActionButtonProps extends Omit<ButtonProps, "children"> {
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

const ActionButton = (props: ActionButtonProps) => {
	const { icon, small, children } = props;

	const renderButton = (): React.ReactElement => (
		<StyledButton variant={"outlined"} fullWidth={!small} {...props}>
			{icon} {!small && children}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={children}>{renderButton()}</Tooltip>;
};

export default React.memo(ActionButton);
