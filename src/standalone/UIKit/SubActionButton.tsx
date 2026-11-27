import React from "react";
import {
	Button,
	ButtonProps,
	CSSObject,
	styled,
	Theme,
	Tooltip,
	useThemeProps,
} from "@mui/material";
import { capitalize } from "@mui/material/utils";
import combineClassNames from "../../utils/combineClassNames";
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
/** Class of the span that holds the icon */
const ICON_CLASS = "CcSubActionButton-icon";
/** Class of a button given a `color` */
const COLORED_CLASS = "CcSubActionButton-colored";

/** The accent: the `main` of the button's palette color */
const ACCENT = "var(--CcSubActionButton-accent)";
/** The hover fill of a small button: the `light` of the button's palette color */
const ACCENT_LIGHT = "var(--CcSubActionButton-accent-light)";
/** The text and icon color on {@link ACCENT_LIGHT} */
const ON_ACCENT_LIGHT = "var(--CcSubActionButton-on-accent-light)";

/** A palette entry MUI's Button can take as its `color`: one with a `main` */
const isButtonColor = (
	value: unknown,
): value is { main: string; light?: unknown } =>
	typeof value === "object" &&
	value !== null &&
	typeof (value as Record<string, unknown>).main === "string";

/**
 * The accent of the button for each palette color, as custom properties on
 * MUI's `MuiButton-color<Name>` class. Without `color`, MUI's Button is
 * `primary`, so primary is the accent then.
 * @param theme The theme
 * @returns The rules for the button slot
 */
const accentColors = (theme: Theme): CSSObject => {
	const rules: CSSObject = {};
	for (const [name, color] of Object.entries(theme.palette)) {
		if (!isButtonColor(color)) continue;
		rules[`&.MuiButton-color${capitalize(name)}`] = {
			"--CcSubActionButton-accent": color.main,
			...(typeof color.light === "string" && {
				"--CcSubActionButton-accent-light": color.light,
				"--CcSubActionButton-on-accent-light": theme.palette.getContrastText(
					color.light,
				),
			}),
		};
	}
	return rules;
};

const StyledButton = styled(Button, {
	name: "CcSubActionButton",
	slot: "button",
	// the only slot, so the theme's variants apply to it as to a root
	skipVariantsResolver: false,
})<{ ownerState: SubActionButtonOwnerState }>(
	({ theme, ownerState: { small, disableDivider } }) => ({
		...accentColors(theme),
		padding: small ? theme.spacing(1) : theme.spacing(1, 3),
		borderRadius: small ? undefined : 0,
		backgroundColor: theme.palette.background.default,
		color: theme.palette.text.primary,
		// given a color, the label is in it at rest too
		[`&.${COLORED_CLASS}`]: {
			color: ACCENT,
		},
		textTransform: "unset",
		justifyContent: "flex-start",
		borderColor:
			theme.palette.mode === "light"
				? "rgba(0, 0, 0, 0.23)"
				: "rgba(255, 255, 255, 0.23)",
		minWidth: small ? "unset" : undefined,
		"&:hover": {
			backgroundColor: small ? ACCENT_LIGHT : theme.palette.background.default,
			borderLeftWidth: 0,
			borderRightWidth: 0,
			borderTopWidth: disableDivider ? 0 : undefined,
			borderBottomWidth: 0,
			borderColor:
				theme.palette.mode === "light"
					? "rgba(0, 0, 0, 0.23)"
					: "rgba(255, 255, 255, 0.23)",
			color: small ? ON_ACCENT_LIGHT : ACCENT,
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
		// as MUI's start icon: the button's flex box, so the icon is centred
		[`& > .${ICON_CLASS}`]: {
			display: "inherit",
		},
		"&.MuiButton-outlined": {
			// the icon is painted through the text color, which an SvgIcon fills
			// with: an icon's own color wins over it
			[`& > .${ICON_CLASS}`]: {
				color: ACCENT,
			},
			"& svg": {
				marginRight: small ? undefined : theme.spacing(3),
			},
			[`&:hover > .${ICON_CLASS}`]: {
				// the label colour of the hover rule above: legible on the hover fill
				color: small ? ON_ACCENT_LIGHT : undefined,
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
				[`& > .${ICON_CLASS}`]: {
					color: theme.palette.text.disabled,
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
	 * The icon before the label, rendered in a `span` with the class
	 * `CcSubActionButton-icon`. It is painted through that span's text color,
	 * which an SvgIcon fills with: the `main` of `color` (by default
	 * `primary.main`), `text.disabled` while disabled, and on the hover fill
	 * of a `small` button the hover's text color. An icon with a color of its
	 * own (an SvgIcon's `color` or `htmlColor`, or a color in its `sx`) keeps
	 * it in every state.
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
	/**
	 * The palette color of the label and the icon, a custom palette color
	 * included: both are its `main`, at rest and on hover, and the hover of a
	 * `small` button fills the cell with its `light` and paints the icon in
	 * `getContrastText(light)`. `"inherit"` takes the parent's text color.
	 * The top border, the divider between rows, stays grey, and a disabled
	 * button is `text.disabled`.
	 * @default undefined: the label is `text.primary` and turns `primary.main`
	 * on hover, the icon is `primary.main`, and a `small` button's hover fills
	 * the cell with `primary.light`
	 */
	color?: ButtonProps["color"];
}

/**
 * A row of an action menu: a full-width outlined MUI `Button` whose only
 * border is the top one, so that stacked rows are separated by a line. The
 * label is `text.primary` and turns `primary.main` on hover, the icon is
 * `primary.main`; with `color`, label and icon are that palette color's
 * `main`. With `small`, an icon-only square cell for a horizontal row.
 *
 * Theme: `components.CcSubActionButton` (`defaultProps`,
 * `styleOverrides.button`, `variants`).
 */
const SubActionButton = (inProps: SubActionButtonProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSubActionButton" });
	const { icon, small, children, disableDivider, className, ...otherProps } =
		props;

	const renderButton = (): React.ReactElement => (
		<StyledButton
			variant={"outlined"}
			fullWidth={!small}
			// named by its label: keeps the Tooltip from naming the button while
			// it is open; an aria-label or aria-labelledby passed in still applies
			aria-label={undefined}
			aria-labelledby={undefined}
			{...otherProps}
			className={combineClassNames([
				className,
				otherProps.color != null && COLORED_CLASS,
			])}
			ownerState={{ small: !!small, disableDivider: !!disableDivider }}
		>
			{icon ? <span className={ICON_CLASS}>{icon}</span> : null}{" "}
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
