import React from "react";
import {
	Button,
	ButtonProps,
	styled,
	Tooltip,
	useThemeProps,
} from "@mui/material";

export interface SubActionButtonOwnerState {
	small: boolean;
	disableDivider: boolean;
}
const StyledButton = styled(Button, {
	name: "CcSubActionButton",
	slot: "button",
})<{ ownerState: SubActionButtonOwnerState }>(
	({ theme, ownerState: { small, disableDivider } }) => ({
		padding: small ? theme.spacing(1) : theme.spacing(1, 3),
		borderRadius: small ? undefined : 0,
		backgroundColor: theme.palette.background.default,
		color: theme.palette.text.primary,
		textTransform: "unset",
		justifyContent: "flex-start",
		borderColor:
			theme.palette.mode === "light"
				? "rgba(0, 0, 0, 0.23)"
				: "rgba(255, 255, 255, 0.23)",
		minWidth: small ? "unset" : undefined,
		"&:hover": {
			backgroundColor: small
				? theme.palette.primary.light
				: theme.palette.background.default,
			borderLeftWidth: 0,
			borderRightWidth: 0,
			borderTopWidth: disableDivider ? 0 : undefined,
			borderBottomWidth: 0,
			borderColor:
				theme.palette.mode === "light"
					? "rgba(0, 0, 0, 0.23)"
					: "rgba(255, 255, 255, 0.23)",
			color: small
				? theme.palette.getContrastText(theme.palette.primary.light)
				: theme.palette.primary.main,
		},
		"&.Mui-disabled": {
			color: theme.palette.text.disabled,
		},
		"&.MuiButton-label": {
			justifyContent: "flex-start",
		},
		"&.MuiButton-outlined": {
			"& svg": {
				fill: theme.palette.primary.main,
				marginRight: small ? undefined : theme.spacing(3),
			},
			"&:hover svg": {
				fill: small ? theme.palette.background.default : undefined,
			},
			borderRadius: small ? 0 : undefined,
			borderLeftWidth: 0,
			borderRightWidth: 0,
			borderBottomWidth: small ? undefined : 0,
			borderTopWidth: disableDivider ? 0 : undefined,
			padding: small ? theme.spacing(2) : theme.spacing(2, 3),
			...(small && {
				"&:first-of-type": {
					borderLeftWidth: 1,
				},
				"&:last-of-type": {
					borderRightWidth: 1,
				},
			}),
			"&.Mui-disabled": {
				"& svg": {
					fill: theme.palette.text.disabled,
				},
				borderLeftWidth: 0,
				borderRightWidth: 0,
				color: theme.palette.text.disabled,
				...(small && {
					borderRadiusWidth: 0,
					"&:first-of-type": {
						borderLeftWidth: 1,
					},
					"&:last-of-type": {
						borderRightWidth: 1,
					},
				}),
				...(!small && {
					borderBottomWidth: 0,
				}),
			},
		},
	}),
);

export type SubActionButtonClassKey = "button";

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
	/**
	 * Flag to disable the top divider
	 */
	disableDivider?: boolean | "true";
}

const SubActionButton = (inProps: SubActionButtonProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSubActionButton" });
	const { icon, small, children, disableDivider, ...otherProps } = props;

	const renderButton = (): React.ReactElement => (
		<StyledButton
			variant={"outlined"}
			fullWidth={!small}
			{...otherProps}
			ownerState={{ small: !!small, disableDivider: !!disableDivider }}
		>
			{icon} {!small && children}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={children}>{renderButton()}</Tooltip>;
};

export default React.memo(SubActionButton);
