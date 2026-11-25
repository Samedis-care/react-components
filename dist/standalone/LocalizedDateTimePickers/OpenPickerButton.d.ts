/**
 * The button that opens a picker's calendar: MUI's default, an `IconButton`,
 * with the library's keyboard focus ring, a 2px outline in
 * `palette.primary.main`, which forced colors keep. MUI shows keyboard focus
 * on it only by a pulsing grey ripple, about 1.5:1 against the field.
 *
 * The ring runs 2px inside the button's edge, around the icon: the button is
 * 40px in every field size, so it reaches the border of a small outlined
 * field, and a ring at or outside its edge would run into that border. When
 * the theme sets `focusVisible`, MUI's ring is the one shown. A caller's
 * `slots.openPickerButton` replaces this button.
 */
declare const OpenPickerButton: import("@emotion/styled").StyledComponent<import("@mui/material").IconButtonOwnProps & Omit<import("@mui/material").ButtonBaseOwnProps, keyof import("@mui/material").IconButtonOwnProps> & Omit<import("@mui/material").ButtonBaseOwnProps, "type" | "tabIndex" | "action" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "nativeButton" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | keyof import("@mui/material").IconButtonOwnProps> & import("@mui/material/OverridableComponent").CommonProps & Omit<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "type" | "className" | "style" | "classes" | "children" | "color" | "sx" | "tabIndex" | "action" | "disabled" | "size" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "nativeButton" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | "disableFocusRipple" | "edge" | "loading" | "loadingIndicator"> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
export default OpenPickerButton;
