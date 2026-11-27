/**
 * MUI's Button with CC's keyboard focus ring: while it has keyboard focus
 * (`Mui-focusVisible`), a 2px solid outline in `palette.primary.main`, 2px
 * outside the button, where MUI draws the ring of the theme's `focusVisible`.
 * Forced colors keep it. MUI's focus ripple stays, and a mouse click shows no
 * ring.
 *
 * When the theme sets MUI's `focusVisible` option, MUI's own ring is the one
 * shown.
 *
 * Takes MUI's Button props.
 */
declare const FocusRingButton: import("@emotion/styled").StyledComponent<import("@mui/material").ButtonOwnProps & Omit<import("@mui/material").ButtonBaseOwnProps, keyof import("@mui/material").ButtonOwnProps> & Omit<import("@mui/material").ButtonBaseOwnProps, "type" | "tabIndex" | "action" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "nativeButton" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | keyof import("@mui/material").ButtonOwnProps> & import("@mui/material/OverridableComponent").CommonProps & Omit<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "type" | "className" | "style" | "classes" | "children" | "color" | "sx" | "tabIndex" | "href" | "action" | "disabled" | "size" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "nativeButton" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | "disableFocusRipple" | "loading" | "loadingIndicator" | "variant" | "fullWidth" | "disableElevation" | "endIcon" | "loadingPosition" | "startIcon"> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
export default FocusRingButton;
