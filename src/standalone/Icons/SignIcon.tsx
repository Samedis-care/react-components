import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import withMuiName from "./withMuiName";

// Source: Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
// Modified: the "feather-alt" icon, scaled from 512x512 to 36x36, rounded to two decimals and padded (VIEW_BOX).

// The 36x36 glyph fitted into Material's 18x18 square keyline and centered on
// its 24-unit grid, so it looks as large as a Material icon of the same size.
// The default: a caller's viewBox replaces it, as on a Material icon.
const VIEW_BOX = "-6 -6 48 48";

const SignIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
	withMuiName(function SignIcon({ viewBox = VIEW_BOX, ...props }, ref) {
		return (
			<SvgIcon {...props} ref={ref} viewBox={viewBox}>
				<path d="M35.16,6.26a52.79,52.79,0,0,1-3,10.26l-7.45,3.73h5.7a33.84,33.84,0,0,1-2.11,3.3L18,27h7.1a17,17,0,0,1-9.35,4,78.53,78.53,0,0,1-8.86.49l-4,4A1.65,1.65,0,0,1,1.69,36a1.67,1.67,0,0,1-1.2-.49A1.63,1.63,0,0,1,0,34.31a1.59,1.59,0,0,1,.49-1.19L18.77,14.91a1.28,1.28,0,0,0,.29-.81,1.17,1.17,0,0,0-.32-.81,1,1,0,0,0-.77-.35,1.11,1.11,0,0,0-.81.35L4.57,25.88q.13-3.16.42-5.63.78-7.87,8-13A38.82,38.82,0,0,1,26.72,1.48,52.78,52.78,0,0,1,36,0,56.86,56.86,0,0,1,35.16,6.26Z" />
			</SvgIcon>
		);
	}),
);

/**
 * A quill: "sign here". SignPad shows it in its button.
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
export default React.memo(SignIcon) as unknown as SvgIconComponent;
