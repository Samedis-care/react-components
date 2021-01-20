import React, { CSSProperties } from "react";
import {
	Box,
	Button,
	ButtonProps,
	Tooltip,
	withStyles,
} from "@material-ui/core";
import { Theme } from "@material-ui/core/styles";
import { combineColors } from "../../utils";

export interface ActionButtonTheme {
	padding?: CSSProperties["padding"];
	border?: CSSProperties["border"];
	backgroundColor?: CSSProperties["backgroundColor"];
	color?: CSSProperties["color"];
	fontSize?: CSSProperties["fontSize"];
	disabled: {
		backgroundColor?: CSSProperties["backgroundColor"];
	};
}

const StyledButton = withStyles((theme: Theme) => ({
	root: (props: ActionButtonProps) => ({
		border: theme.componentsCare?.uiKit?.actionButton?.border,
		backgroundColor:
			theme.componentsCare?.uiKit?.actionButton?.backgroundColor ||
			theme.palette.primary.main,
		color:
			theme.componentsCare?.uiKit?.actionButton?.color ||
			theme.palette.primary.contrastText,
		fontSize: theme.componentsCare?.uiKit?.actionButton?.fontSize,
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
		padding: props.small
			? 5
			: theme.componentsCare?.uiKit?.actionButton?.padding,
	}),
	outlined: (props: ActionButtonProps) => ({
		borderRadius: 25,
		"&.Mui-disabled": {
			border: theme.componentsCare?.uiKit?.actionButton?.border,
			color: theme.palette.background.paper,
			backgroundColor:
				theme.componentsCare?.uiKit?.actionButton?.disabled?.backgroundColor,
		},
		padding: props.small
			? 5
			: theme.componentsCare?.uiKit?.actionButton?.padding,
	}),
	label: {
		padding: 0,
		justifyContent: "flex-start",
	},
}))(Button);

export interface ActionButtonProps extends Omit<ButtonProps, "children"> {
	/**
	 * The icon of the button
	 */
	icon?: React.ReactNode;
	/**
	 * Adjust full width of the button
	 */
	fullWidth?: boolean;
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
	const { icon, fullWidth, small, children, ...otherProps } = props;

	const renderButton = (): React.ReactElement => (
		<StyledButton
			variant={"outlined"}
			fullWidth={!small || fullWidth}
			{...otherProps}
			startIcon={icon}
		>
			{!small && <Box>{children}</Box>}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={children}>{renderButton()}</Tooltip>;
};

export default React.memo(ActionButton);
