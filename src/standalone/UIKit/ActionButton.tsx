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
	borderRadius?: CSSProperties["borderRadius"];
	backgroundColor?: CSSProperties["backgroundColor"];
	color?: CSSProperties["color"];
	fontSize?: CSSProperties["fontSize"];
	style?: CSSProperties;
	hover?: {
		border?: CSSProperties["border"];
		style?: CSSProperties;
	};
	disabled?: {
		backgroundColor?: CSSProperties["backgroundColor"];
		style?: CSSProperties;
	};
	label?: {
		style?: CSSProperties;
	};
}

const StyledButton = withStyles((theme: Theme) => ({
	root: (props: ActionButtonProps) => ({
		border: theme.componentsCare?.uiKit?.actionButton?.border,
		backgroundColor: props.color
			? undefined
			: props.backgroundColor ||
			  theme.componentsCare?.uiKit?.actionButton?.backgroundColor ||
			  theme.palette.primary.main,
		color:
			props.textColor ||
			props.color ||
			theme.componentsCare?.uiKit?.actionButton?.color ||
			theme.palette.primary.contrastText,
		fontSize: theme.componentsCare?.uiKit?.actionButton?.fontSize,
		textTransform: "unset",
		"&:hover": {
			border:
				theme.componentsCare?.uiKit?.actionButton?.hover?.border ||
				theme.componentsCare?.uiKit?.actionButton?.border,
			backgroundColor: props.color
				? undefined
				: `rgba(${combineColors(
						props.backgroundColor || theme.palette.primary.main,
						theme.palette.action.hover
				  ).join()})`,
			...{
				...theme.componentsCare?.uiKit?.actionButton?.style,
				...theme.componentsCare?.uiKit?.actionButton?.hover?.style,
			},
		},
		"&.Mui-disabled": {
			backgroundColor: theme.palette.action.disabled,
			...{
				...theme.componentsCare?.uiKit?.actionButton?.style,
				...theme.componentsCare?.uiKit?.actionButton?.disabled?.style,
			},
		},
		minWidth: props.small ? 0 : undefined,
		padding: theme.componentsCare?.uiKit?.actionButton?.padding,
		paddingLeft: props.small ? theme.spacing(3) : undefined,
		paddingRight: props.small ? theme.spacing(3) : undefined,
		...theme.componentsCare?.uiKit?.actionButton?.style,
	}),
	startIcon: (props: ActionButtonProps) => ({
		margin: props.small ? 0 : undefined,
	}),
	outlined: (props: ActionButtonProps) => ({
		borderRadius:
			theme.componentsCare?.uiKit?.actionButton?.borderRadius ||
			theme.spacing(1),
		"&.Mui-disabled": {
			border: theme.componentsCare?.uiKit?.actionButton?.border,
			color: theme.palette.background.paper,
			backgroundColor:
				theme.componentsCare?.uiKit?.actionButton?.disabled?.backgroundColor,
		},
		padding: theme.componentsCare?.uiKit?.actionButton?.padding,
		paddingLeft: props.small ? theme.spacing(3) : undefined,
		paddingRight: props.small ? theme.spacing(3) : undefined,
		...theme.componentsCare?.uiKit?.actionButton?.style,
	}),
	contained: (props: ActionButtonProps) => ({
		borderRadius:
			theme.componentsCare?.uiKit?.actionButton?.borderRadius ||
			theme.spacing(1),
		"&.Mui-disabled": {
			border: theme.componentsCare?.uiKit?.actionButton?.border,
			color: theme.palette.background.paper,
			backgroundColor:
				theme.componentsCare?.uiKit?.actionButton?.disabled?.backgroundColor,
		},
		padding: theme.componentsCare?.uiKit?.actionButton?.padding,
		paddingLeft: props.small ? theme.spacing(3) : undefined,
		paddingRight: props.small ? theme.spacing(3) : undefined,
		...theme.componentsCare?.uiKit?.actionButton?.style,
	}),
	label: (props: ActionButtonProps) => ({
		padding: 0,
		justifyContent: props.small ? "center" : "flex-start",
		...theme.componentsCare?.uiKit?.actionButton?.label?.style,
	}),
}))(Button);

const StyledIconBox = withStyles(() => ({
	root: {
		overflow: "hidden",
		width: 0,
	},
}))(Box);

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
	/**
	 * Custom colored buttons
	 */
	textColor?: CSSProperties["color"];
	backgroundColor?: CSSProperties["backgroundColor"];
	borderColor?: CSSProperties["borderColor"];
}

const ActionButton = (props: ActionButtonProps) => {
	const { icon, fullWidth, small, children, ...otherProps } = props;

	const renderButton = (): React.ReactElement => (
		<StyledButton
			variant={"contained"}
			disableElevation={true}
			fullWidth={!small || fullWidth}
			startIcon={icon}
			{...otherProps}
		>
			{small ? <StyledIconBox>&nbsp;</StyledIconBox> : <Box>{children}</Box>}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={children}>{renderButton()}</Tooltip>;
};

export default React.memo(ActionButton);
