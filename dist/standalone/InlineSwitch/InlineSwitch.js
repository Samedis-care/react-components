import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { styled, Switch, Typography, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import addSlotAttributes from "../../utils/internal/addSlotAttributes";
const AntSwitch = styled(Switch, { name: "CcInlineSwitch", slot: "switch" })(({ theme }) => ({
    width: 35,
    height: 16,
    padding: 0,
    display: "flex",
    // the track fills the root, so the focus ring around it lies outside the root
    overflow: "visible",
    "& .MuiSwitch-switchBase": {
        padding: 2,
        // the thumb, the only cue of the off state, in the color of MUI's unchecked
        // Checkbox: at least 3:1 against the track. Colors are read through the CSS
        // variables if the theme has them, so they follow a color scheme switch
        color: (theme.vars || theme).palette.text.secondary,
        // MUI widens the input past the thumb and lets the root clip it to the
        // track; the root no longer clips, so the input covers just the track
        "& .MuiSwitch-input": { left: 0, width: 35 },
        "&.Mui-checked": {
            transform: "translateX(18px)",
            // the color for content on primary.main: at least 3:1 against the track
            color: (theme.vars || theme).palette.primary.contrastText,
            "& .MuiSwitch-input": { left: -18 },
            "& + .MuiSwitch-track": {
                opacity: 1,
                backgroundColor: (theme.vars || theme).palette.primary.main,
                borderColor: (theme.vars || theme).palette.primary.main,
            },
            // as faint as the unchecked track while disabled, like MUI's Switch
            "&.Mui-disabled + .MuiSwitch-track": {
                opacity: theme.vars
                    ? theme.vars.opacity.switchTrackDisabled
                    : theme.palette.mode === "light"
                        ? 0.12
                        : 0.2,
            },
        },
        // keyboard focus: with the theme's focusVisible MUI draws its own ring on
        // the track; otherwise this one (MUI's default shows only the focus ripple)
        ...(!theme.focusVisible && {
            "&.Mui-focusVisible + .MuiSwitch-track": {
                outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
                outlineOffset: 2,
            },
        }),
    },
    "& .MuiSwitch-thumb": {
        width: 12,
        height: 12,
        boxShadow: "none",
    },
    "& .MuiSwitch-track": {
        // the track's edge: at least 3:1 against the page
        border: `1px solid ${(theme.vars || theme).palette.text.secondary}`,
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: (theme.vars || theme).palette.background.paper,
    },
}));
// static classes of the slots and state classes of the root, see InlineSwitchClassKey
const ROOT_CLASS = "CcInlineSwitch-root";
const SWITCH_WRAPPER_CLASS = "CcInlineSwitch-switchWrapper";
const SWITCH_CLASS = "CcInlineSwitch-switch";
const CHECKED_CLASS = "CcInlineSwitch-checked";
const VISIBLE_CLASS = "CcInlineSwitch-visible";
const DISABLED_CLASS = "CcInlineSwitch-disabled";
// the root holds the floated switch row and floated children, so what follows it
// starts below them instead of flowing beside them. No margin: the surrounding layout
// spaces it
const StyledRoot = styled("div", { name: "CcInlineSwitch", slot: "root" })({
    display: "flow-root",
});
// the height of the switch's row: the switch and the first line of its label are
// centered in it
const ROW_HEIGHT = 30;
const StyledSwitchWrapper = styled(Typography, {
    name: "CcInlineSwitch",
    slot: "switchWrapper",
})(({ theme }) => ({
    float: "right",
    [`&.${DISABLED_CLASS}`]: {
        color: (theme.vars || theme).palette.text.disabled,
    },
}));
// the row of switch and label, a flex row that does not wrap. A `<label>` holds
// phrasing content only, so its cells are spans. A label too long for the space
// beside the switch wraps there, at a space or, inside a word longer than that
// space, at any character, so the float is never wider than the root and the switch
// never leaves it. Both start at the row's top. A click anywhere on it toggles the
// switch, so it shows the pointer cursor, as MUI's FormControlLabel does
const StyledLabel = styled("label")(({ theme }) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    cursor: "pointer",
    [`.${DISABLED_CLASS} > &`]: {
        cursor: "default",
    },
    // without a label (a switch named by `aria-label`) the row is as high as the switch
    "&:has(> :last-child:empty) > *": {
        height: "auto",
        paddingBlock: 0,
    },
}));
// the switch keeps its width, centered in the row's height
const StyledSwitchCell = styled("span")({
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    height: ROW_HEIGHT,
});
// the label's lines have the caption's line height; the first one is centered in the
// row's height, beside the switch
const StyledLabelText = styled("span")({
    minWidth: 0,
    overflowWrap: "anywhere",
    paddingBlock: `calc((${ROW_HEIGHT}px - 1lh) / 2)`,
});
const InlineSwitch = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcInlineSwitch" });
    const { label, value, onChange, visible, disabled, children, classes, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, slotProps, } = props;
    // name, description and form identity belong to the input, not the switch's root
    // span; the typed aria props win over the caller's input slot props
    const switchSlotProps = useMemo(() => ({
        input: addSlotAttributes(slotProps, "input", {
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledBy,
            "aria-describedby": ariaDescribedBy,
        })?.input,
    }), [slotProps, ariaLabel, ariaLabelledBy, ariaDescribedBy]);
    const handleSwitchChange = useCallback((event) => {
        // a click event dispatched on the disabled input by a script can still reach React
        if (disabled)
            return;
        if (onChange)
            onChange(event.target.checked);
    }, [onChange, disabled]);
    return (_jsxs(StyledRoot, { className: combineClassNames([
            ROOT_CLASS,
            className,
            classes?.root,
            value && CHECKED_CLASS,
            visible && VISIBLE_CLASS,
            disabled && DISABLED_CLASS,
        ]), children: [visible && (_jsx(StyledSwitchWrapper, { component: "div", className: combineClassNames([
                    SWITCH_WRAPPER_CLASS,
                    classes?.switchWrapper,
                    disabled && DISABLED_CLASS,
                ]), variant: "caption", children: _jsxs(StyledLabel, { children: [_jsx(StyledSwitchCell, { children: _jsx(AntSwitch, { className: combineClassNames([SWITCH_CLASS, classes?.switch]), checked: value, onChange: handleSwitchChange, disabled: disabled, 
                                // the focus ring shows focus; the ripple would pulse under it endlessly
                                disableFocusRipple: true, slotProps: switchSlotProps }) }), _jsx(StyledLabelText, { children: label })] }) })), _jsx("div", { children: children })] }));
};
/**
 * A container with an optional compact switch (35x16) and its label, floated
 * at the top right of `children`. `BaseSelector` renders every selector field
 * inside one (its `displaySwitch`/`switchLabel`), and `MultiSelectWithoutGroup`
 * one around its chips, mostly with `visible={false}`.
 *
 * It is the selectors' filter switch: the switch and its caption-sized label are
 * small enough to share the row of a field's label, beside the content they
 * filter. For a labeled switch of its own, in a filter bar, a toolbar or a form,
 * use MUI's `FormControlLabel` with a `Switch` (`size="small"` for a compact one).
 *
 * A click anywhere on the label toggles the switch, and the label shows the
 * pointer cursor (the default one while `disabled`), as MUI's
 * `FormControlLabel` does.
 *
 * The switch is controlled: pass `value` and `onChange`, or `disabled` for a
 * switch the user cannot toggle.
 *
 * The root is as high as the switch row and the children together: what follows
 * it starts below both. It has no margin of its own; the surrounding layout spaces
 * it (`styled(InlineSwitch)` or `styleOverrides.root` can add one).
 *
 * The switch takes its colors from the theme's palette, through its CSS
 * variables if it has them: off, a `text.secondary` thumb on a
 * `background.paper` track with a `text.secondary` edge; on, a
 * `primary.contrastText` thumb on a `primary.main` track. `styleOverrides.switch`
 * can change them.
 */
export default React.memo(InlineSwitch);
