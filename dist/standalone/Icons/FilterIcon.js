import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { SvgIcon } from "@mui/material";
import withMuiName from "./withMuiName";
// Source: Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
// Modified: the "filter" icon, scaled from 512x512 to 26x26.02, rounded to two decimals and padded (VIEW_BOX).
// The 26x26.02 glyph fitted into Material's 18x18 square keyline and centered
// on its 24-unit grid, so it looks as large as a Material icon of the same size.
// The default: a caller's viewBox replaces it, as on a Material icon.
const VIEW_BOX = "-4.347 -4.337 34.693 34.693";
const FilterIcon = React.forwardRef(withMuiName(function FilterIcon({ viewBox = VIEW_BOX, ...props }, ref) {
    return (_jsx(SvgIcon, { ...props, ref: ref, viewBox: viewBox, children: _jsx("path", { d: "M25.64.36a1.15,1.15,0,0,1,.36.86,1.15,1.15,0,0,1-.36.86l-9.39,9.4v13.3a1.13,1.13,0,0,1-.66,1.09,1.19,1.19,0,0,1-1.27-.07L10.26,23a1.25,1.25,0,0,1-.51-1V11.48L.36,2.08A1.15,1.15,0,0,1,0,1.22,1.15,1.15,0,0,1,.36.36,1.15,1.15,0,0,1,1.22,0H24.78A1.15,1.15,0,0,1,25.64.36Z" }) }));
}));
/**
 * A solid funnel: "filter".
 *
 * Takes MUI `SvgIconProps`, like a Material icon. Size it with `fontSize`
 * (`"small"` 20px, `"medium"` 24px, the default, `"large"` 35px, `"inherit"`
 * 1em of the parent's font size) or `sx`, and color it with `color` (a palette
 * key such as `"primary"`; default `"inherit"`, the parent's text color) or
 * `htmlColor` (any CSS color, used when `color` is `"inherit"`). The glyph is
 * drawn on Material's 24-unit grid, so it looks as large as a Material icon of
 * the same `fontSize`. `viewBox` defaults to that padded box; a caller's
 * `viewBox` replaces it, as on a Material icon. `children` are ignored.
 *
 * Accessibility: decorative by default, like every MUI icon: the `<svg>` has
 * `aria-hidden="true"` and is not focusable. To use it as a control, put it
 * inside an `IconButton` with an `aria-label` (and a `Tooltip` for sighted
 * users, if the icon alone is not clear): the button is the tab stop, carries
 * the name and is activated by Enter and Space. An `onClick`, `aria-label` or
 * `Tooltip` on the icon itself is neither announced by screen readers nor
 * reachable by keyboard: the `<svg>` stays hidden, and a Tooltip writes its
 * title onto that hidden `<svg>`. For an icon that carries meaning on its own,
 * pass `titleAccess`: it adds `role="img"` and a `<title>` as its name.
 *
 * `ref` reaches the `<svg>`. There is no `Cc*` theme slot: style it with `sx`
 * or `className`, or app-wide through `components.MuiSvgIcon`, which also
 * affects every MUI icon.
 */
export default React.memo(FilterIcon);
