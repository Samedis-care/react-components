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
import focusRing from "../../utils/internal/focusRing";

/**
 * Key of the theme's `components.CcActionButton.styleOverrides`: `button`,
 * the MUI `Button`, ActionButton's only slot. A function override gets its
 * {@link ActionButtonOwnerState}. Theme `variants` style the button too.
 */
export type ActionButtonClassKey = "button";

/**
 * The `ownerState` of the `button` slot: two flags, not ActionButton's
 * props. A function in the theme's `styleOverrides` gets it. A theme
 * variant's `props` object matches each key against the button's props
 * (every ActionButton prop but `icon`, `small` and `children`, `fullWidth`
 * as applied) and against these flags; a `props` function gets the button's
 * props with these flags in place of `small` and `color`.
 */
export interface ActionButtonOwnerState {
	/**
	 * Whether the `small` prop is set (`"true"` included)
	 */
	small: boolean;
	/**
	 * Whether a `color` prop is set, whatever its value (`"primary"`
	 * included); not the color itself
	 */
	color: boolean;
}

const StyledButton = styled(Button, {
	name: "CcActionButton",
	slot: "button",
	// the only slot, so the theme's variants apply to it as to a root
	skipVariantsResolver: false,
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
		// outside the button: drawn on its own fill, the ring would not show
		"&.Mui-focusVisible": focusRing(theme, 2),
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

export default React.memo(ActionButton) as typeof ActionButton;
