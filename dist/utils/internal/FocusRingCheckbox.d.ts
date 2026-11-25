/**
 * MUI's Checkbox with CC's keyboard focus ring around its box (the icon), where MUI
 * draws the ring of the theme's `focusVisible`: a 2px solid outline in
 * `palette.primary.main`, 2px outside the box, with the theme's corner radius.
 * Forced colors keep it. MUI's focus ripple stays, and a mouse click shows no ring.
 *
 * When the theme sets MUI's `focusVisible` option, MUI's own ring is the one shown.
 *
 * Takes MUI's Checkbox props. The UIKit Checkbox draws the same ring itself.
 */
declare const FocusRingCheckbox: import("@emotion/styled").StyledComponent<import("@mui/material").CheckboxProps & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
export default FocusRingCheckbox;
