import React from "react";
import {
	Button,
	ButtonProps,
	styled,
	Tooltip,
	useThemeProps,
} from "@mui/material";
import focusRing from "../../utils/internal/focusRing";

/**
 * The `ownerState` of the `button` slot: two flags. A function in the
 * theme's `styleOverrides` gets it. A theme variant's `props` object matches
 * each key against the button's props (every SubActionButton prop but
 * `icon`, `small`, `disableDivider` and `children`, `fullWidth` as applied)
 * and against these flags; a `props` function gets the button's props and
 * these flags.
 */
export interface SubActionButtonOwnerState {
	/**
	 * Whether the `small` prop is set
	 */
	small: boolean;
	/**
	 * Whether the `disableDivider` prop is set (`"true"` included)
	 */
	disableDivider: boolean;
}

/** Class of the span that holds the label of a small button */
const HIDDEN_LABEL_CLASS = "CcSubActionButton-hiddenLabel";

const StyledButton = styled(Button, {
	name: "CcSubActionButton",
	slot: "button",
	// the only slot, so the theme's variants apply to it as to a root
	skipVariantsResolver: false,
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
		// inside the row: the rows fill their menu, which may clip an outer ring
		"&.Mui-focusVisible": focusRing(theme, -2),
		// the label of a small button: visually hidden, as MUI's visuallyHidden,
		// so it names the button while only the icon shows
		[`& > .${HIDDEN_LABEL_CLASS}`]: {
			border: 0,
			clipPath: "inset(50%)",
			height: 1,
			margin: -1,
			overflow: "hidden",
			padding: 0,
			position: "absolute",
			whiteSpace: "nowrap",
			width: 1,
		},
		"&.MuiButton-outlined": {
			"& svg": {
				fill: theme.palette.primary.main,
				marginRight: small ? undefined : theme.spacing(3),
			},
			"&:hover svg": {
				// the label colour of the hover rule above: legible on primary.light
				fill: small
					? theme.palette.getContrastText(theme.palette.primary.light)
					: undefined,
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

/**
 * Key of the theme's `components.CcSubActionButton.styleOverrides`:
 * `button`, the MUI `Button`, SubActionButton's only slot. A function
 * override gets its {@link SubActionButtonOwnerState}. Theme `variants` style
 * the button too.
 */
export type SubActionButtonClassKey = "button";

export interface SubActionButtonProps extends Omit<ButtonProps, "children"> {
	/**
	 * The icon of the button
	 */
	icon?: React.ReactNode;
	/**
	 * Show only the icon, for a compact button. The label (`children`) stays
	 * in the button as visually hidden text, which names it in every state,
	 * and shows as a tooltip on hover and on keyboard focus (not while
	 * disabled). Use it with `icon`.
	 * @default false
	 */
	small?: boolean;
	/**
	 * The label, already translated: a string or any other node (no
	 * interactive content). It names the button, also with `small`, where it
	 * is visually hidden and shows as a tooltip. An `aria-label` or
	 * `aria-labelledby` replaces that name, also while the tooltip is open.
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
			// named by its label: keeps the Tooltip from naming the button while
			// it is open; an aria-label or aria-labelledby passed in still applies
			aria-label={undefined}
			aria-labelledby={undefined}
			{...otherProps}
			ownerState={{ small: !!small, disableDivider: !!disableDivider }}
		>
			{icon}{" "}
			{small ? (
				<span className={HIDDEN_LABEL_CLASS}>{children}</span>
			) : (
				children
			)}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={children}>{renderButton()}</Tooltip>;
};

export default React.memo(SubActionButton);
