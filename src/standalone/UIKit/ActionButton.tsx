import React from "react";
import {
	Box,
	Button,
	ButtonProps,
	Tooltip,
	styled,
	useThemeProps,
} from "@mui/material";
import combineColors from "../../utils/combineColors";

export type ActionButtonClassKey = "button";

export interface ActionButtonOwnerState {
	small: boolean;
	color: boolean;
}

const StyledButton = styled(Button, {
	name: "CcActionButton",
	slot: "button",
})<{ ownerState: ActionButtonOwnerState }>(({
	theme,
	ownerState: { small, color },
}) => {
	return {
		backgroundColor: color ? undefined : theme.palette.primary.main,
		color: color ? undefined : theme.palette.primary.contrastText,
		textTransform: "unset",
		justifyContent: "flex-start",
		"&:hover": {
			backgroundColor: color
				? undefined
				: `rgba(${combineColors(
						theme.palette.primary.main,
						theme.palette.action.hover,
					).join()})`,
		},
		"&:.Mui-disabled": {
			backgroundColor: theme.palette.action.disabled,
		},
		minWidth: small ? 0 : undefined,
		paddingLeft: small ? theme.spacing(3) : undefined,
		paddingRight: small ? theme.spacing(3) : undefined,
		"&.MuiButton-startIcon": {
			margin: small ? 0 : undefined,
		},
		"&.MuiButton-outlined": {
			borderRadius: theme.shape.borderRadius,
			"&.Mui-disabled": {
				color: theme.palette.background.paper,
			},
			paddingLeft: small ? theme.spacing(3) : undefined,
			paddingRight: small ? theme.spacing(3) : undefined,
		},
		"&.MuiButton-contained": {
			borderRadius: theme.shape.borderRadius,
			"&.Mui-disabled": {
				color: theme.palette.background.paper,
			},
			paddingLeft: small ? theme.spacing(3) : undefined,
			paddingRight: small ? theme.spacing(3) : undefined,
		},
		"&.MuiButton-label": {
			padding: 0,
			justifyContent: small ? "center" : "flex-start",
		},
	};
});

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
	small?: boolean | "true";
	/**
	 * The text of the button (used for tooltip if small is true)
	 */
	children: React.ReactNode;
}

const ActionButton = (inProps: ActionButtonProps) => {
	const props = useThemeProps({ props: inProps, name: "CcActionButton" });
	const { icon, fullWidth, small, children, ...otherProps } = props;

	const renderButton = (): React.ReactElement => (
		<StyledButton
			variant={"contained"}
			disableElevation={true}
			fullWidth={fullWidth ?? !small}
			startIcon={icon}
			ownerState={{ small: Boolean(small), color: Boolean(otherProps.color) }}
			{...otherProps}
		>
			{!small && <Box>{children}</Box>}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={<span>{children}</span>}>{renderButton()}</Tooltip>;
};

export default React.memo(ActionButton);
