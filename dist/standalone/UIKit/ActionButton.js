import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { Box, Button, darken, Tooltip, styled, useThemeProps, } from "@mui/material";
import { capitalize } from "@mui/material/utils";
import combineColors from "../../utils/combineColors";
import focusRing from "../../utils/internal/focusRing";
import readableFill from "../../utils/internal/readableFill";
import { luminance, parseColor } from "../../utils/internal/readableTextColor";
/** A palette entry MUI can paint a contained button in */
const isPaletteColor = (value) => typeof value === "object" &&
    value !== null &&
    ["main", "dark", "contrastText"].every((key) => typeof value[key] === "string");
/**
 * Fills for a `color` whose `contrastText` misses 4.5:1 on MUI's fills, `main`
 * at rest and `dark` on hover: each moves by as little as reaches 4.5:1, in its
 * own hue. A hover fill that would then be no darker than the resting one is
 * darkened from the resting fill instead, as MUI derives `dark` from `main`,
 * so hovering still shows. Colors that reach 4.5:1 keep MUI's fills.
 * @param theme The theme
 * @returns The rules for the button slot
 */
const readableColorFills = (theme) => {
    const { tonalOffset } = theme.palette;
    const darkOffset = typeof tonalOffset === "number" ? tonalOffset * 1.5 : tonalOffset.dark;
    const rules = {};
    for (const [name, color] of Object.entries(theme.palette)) {
        if (!isPaletteColor(color))
            continue;
        const rest = readableFill(color.main, color.contrastText);
        let hover = readableFill(color.dark, color.contrastText);
        if (rest === color.main && hover === color.dark)
            continue;
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
const StyledButton = styled(Button, {
    name: "CcActionButton",
    slot: "button",
    // the only slot, so the theme's variants apply to it as to a root
    skipVariantsResolver: false,
})(({ theme, ownerState: { small, color }, }) => {
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
                : readableFill(`rgba(${combineColors(primaryFill, theme.palette.action.hover).join()})`, primary.contrastText),
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
    };
});
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
const ActionButton = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcActionButton" });
    const { icon, fullWidth, small, children, ...otherProps } = props;
    const renderButton = () => (_jsx(StyledButton, { variant: "contained", disableElevation: true, fullWidth: fullWidth ?? !small, startIcon: icon, ownerState: { small: Boolean(small), color: Boolean(otherProps.color) }, ...otherProps, children: !small && _jsx(Box, { children: children }) }));
    if (props.disabled || !small)
        return renderButton();
    return _jsx(Tooltip, { title: _jsx("span", { children: children }), children: renderButton() });
};
export default React.memo(ActionButton);
