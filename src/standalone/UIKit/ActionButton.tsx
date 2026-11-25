import React from "react";
import {
	Box,
	Button,
	ButtonProps,
	CSSObject,
	darken,
	PaletteColor,
	Theme,
	Tooltip,
	styled,
	useThemeProps,
} from "@mui/material";
import { capitalize } from "@mui/material/utils";
import combineColors from "../../utils/combineColors";
import focusRing from "../../utils/internal/focusRing";
import readableFill from "../../utils/internal/readableFill";
import { luminance, parseColor } from "../../utils/internal/readableTextColor";

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

/** A palette entry MUI can paint a contained button in */
const isPaletteColor = (value: unknown): value is PaletteColor =>
	typeof value === "object" &&
	value !== null &&
	["main", "dark", "contrastText"].every(
		(key) => typeof (value as Record<string, unknown>)[key] === "string",
	);

/**
 * Fills for a `color` whose `contrastText` misses 4.5:1 on MUI's fills, `main`
 * at rest and `dark` on hover: each moves by as little as reaches 4.5:1, in its
 * own hue. A hover fill that would then be no darker than the resting one is
 * darkened from the resting fill instead, as MUI derives `dark` from `main`,
 * so hovering still shows. Colors that reach 4.5:1 keep MUI's fills.
 * @param theme The theme
 * @returns The rules for the button slot
 */
const readableColorFills = (theme: Theme): CSSObject => {
	const { tonalOffset } = theme.palette;
	const darkOffset =
		typeof tonalOffset === "number" ? tonalOffset * 1.5 : tonalOffset.dark;
	const rules: CSSObject = {};
	for (const [name, color] of Object.entries(theme.palette)) {
		if (!isPaletteColor(color)) continue;
		const rest = readableFill(color.main, color.contrastText);
		let hover = readableFill(color.dark, color.contrastText);
		if (rest === color.main && hover === color.dark) continue;
		const restRgba = parseColor(rest);
		const hoverRgba = parseColor(hover);
		if (restRgba && hoverRgba && luminance(hoverRgba) >= luminance(restRgba))
			hover = readableFill(darken(rest, darkOffset), color.contrastText);
		// MUI paints the contained fill from this property
		rules[`&.MuiButton-color${capitalize(name)}`] = {
			"--variant-containedBg": rest,
			"@media (hover: hover)": {
				"&:hover": { "--variant-containedBg": hover },
			},
		};
	}
	// with CSS theme variables, only in the color scheme theme.palette
	// describes; other schemes keep MUI's fills
	return theme.applyStyles(theme.palette.mode, rules);
};

/** Class of the span that holds the label of a small button */
const HIDDEN_LABEL_CLASS = "CcActionButton-hiddenLabel";

const StyledButton = styled(Button, {
	name: "CcActionButton",
	slot: "button",
	// the only slot, so the theme's variants apply to it as to a root
	skipVariantsResolver: false,
})<{ ownerState: ActionButtonOwnerState }>(({
	theme,
	ownerState: { small, color },
}) => {
	const { primary } = theme.palette;
	const primaryFill = readableFill(primary.main, primary.contrastText);
	return {
		backgroundColor: color ? undefined : primaryFill,
		color: color ? undefined : primary.contrastText,
		textTransform: "unset",
		justifyContent: "flex-start",
		"&:hover": {
			backgroundColor: color
				? undefined
				: readableFill(
						`rgba(${combineColors(
							primaryFill,
							theme.palette.action.hover,
						).join()})`,
						primary.contrastText,
					),
		},
		...(color && readableColorFills(theme)),
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
	 * Show only the icon, for a compact button. The label (`children`) stays
	 * in the button as visually hidden text, which names it in every state,
	 * and shows as a tooltip on hover and on keyboard focus (not while
	 * disabled). Use it with `icon`. `"true"` is the same as `true`.
	 * @default false
	 */
	small?: boolean | "true";
	/**
	 * The label, already translated: a string or any other node (no
	 * interactive content). It names the button, also with `small`, where it
	 * is visually hidden and shows as a tooltip. An `aria-label` or
	 * `aria-labelledby` replaces that name, also while the tooltip is open.
	 */
	children: React.ReactNode;
	/**
	 * The palette color the button is painted in, a custom palette color
	 * included: as on MUI's `Button`, the fill is its `main`, the text its
	 * `contrastText` and the hover fill its `dark`. A fill on which
	 * `contrastText` has less than 4.5:1 is darkened (behind dark text:
	 * lightened) just enough, in its own hue. This, or
	 * `components.CcActionButton.defaultProps.color` in the theme, is how an
	 * ActionButton is recolored: overriding only `backgroundColor` keeps
	 * primary's text color and hover.
	 * @default undefined: painted in `palette.primary` by ActionButton itself
	 */
	color?: ButtonProps["color"];
}

/**
 * The main call to action of a form or page: a contained MUI `Button` without
 * elevation, full width by default.
 *
 * Without `color` it is painted in `palette.primary`. Recolor it with `color`,
 * or for every ActionButton with `components.CcActionButton.defaultProps.color`
 * in the theme: fill, text and hover then all come from that palette color.
 * The text reaches 4.5:1 at rest and on hover in any palette: a fill on which
 * the palette's `contrastText` falls short is darkened (behind dark text:
 * lightened) just enough, in its own hue. A `backgroundColor` set in
 * `styleOverrides.button`, `styled()` or `sx` changes only the fill and is
 * used as it is: the text keeps primary's `contrastText` and the hover turns
 * the button primary. An override that paints its own fill sets `color` and
 * the `&:hover` fill as well.
 */
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
			// named by its label: keeps the Tooltip from naming the button while
			// it is open; an aria-label or aria-labelledby passed in still applies
			aria-label={undefined}
			aria-labelledby={undefined}
			{...otherProps}
		>
			{small ? (
				<span className={HIDDEN_LABEL_CLASS}>{children}</span>
			) : (
				<Box>{children}</Box>
			)}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={<span>{children}</span>}>{renderButton()}</Tooltip>;
};

export default React.memo(ActionButton) as typeof ActionButton;
