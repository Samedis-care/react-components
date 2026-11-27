import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Button, styled, Tooltip, useThemeProps, } from "@mui/material";
import { capitalize } from "@mui/material/utils";
import combineClassNames from "../../utils/combineClassNames";
import focusRing from "../../utils/internal/focusRing";
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
const isButtonColor = (value) => typeof value === "object" &&
    value !== null &&
    typeof value.main === "string";
/**
 * The accent of the button for each palette color, as custom properties on
 * MUI's `MuiButton-color<Name>` class. Without `color`, MUI's Button is
 * `primary`, so primary is the accent then.
 * @param theme The theme
 * @returns The rules for the button slot
 */
const accentColors = (theme) => {
    const rules = {};
    for (const [name, color] of Object.entries(theme.palette)) {
        if (!isButtonColor(color))
            continue;
        rules[`&.MuiButton-color${capitalize(name)}`] = {
            "--CcSubActionButton-accent": color.main,
            ...(typeof color.light === "string" && {
                "--CcSubActionButton-accent-light": color.light,
                "--CcSubActionButton-on-accent-light": theme.palette.getContrastText(color.light),
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
})(({ theme, ownerState: { small, disableDivider } }) => ({
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
    borderColor: theme.palette.mode === "light"
        ? "rgba(0, 0, 0, 0.23)"
        : "rgba(255, 255, 255, 0.23)",
    minWidth: small ? "unset" : undefined,
    "&:hover": {
        backgroundColor: small ? ACCENT_LIGHT : theme.palette.background.default,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: disableDivider ? 0 : undefined,
        borderBottomWidth: 0,
        borderColor: theme.palette.mode === "light"
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
}));
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
const SubActionButton = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcSubActionButton" });
    const { icon, small, children, disableDivider, className, ...otherProps } = props;
    const renderButton = () => (_jsxs(StyledButton, { variant: "outlined", fullWidth: !small, "aria-label": undefined, "aria-labelledby": undefined, ...otherProps, className: combineClassNames([
            className,
            otherProps.color != null && COLORED_CLASS,
        ]), ownerState: { small: !!small, disableDivider: !!disableDivider }, children: [icon ? _jsx("span", { className: ICON_CLASS, children: icon }) : null, " ", small ? (_jsx("span", { className: HIDDEN_LABEL_CLASS, children: children })) : (children)] }));
    if (props.disabled || !small)
        return renderButton();
    return _jsx(Tooltip, { title: children, children: renderButton() });
};
export default React.memo(SubActionButton);
