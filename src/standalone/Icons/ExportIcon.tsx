import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import withMuiName from "./withMuiName";

// The 27x36 glyph fitted into Material's 16x20 portrait keyline and centered
// on its 24-unit grid, so it looks as large as a Material icon of the same size.
// The default: a caller's viewBox replaces it, as on a Material icon.
const VIEW_BOX = "-8.1 -3.6 43.2 43.2";

const ExportIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
	withMuiName(function ExportIcon({ viewBox = VIEW_BOX, ...props }, ref) {
		return (
			<SvgIcon {...props} ref={ref} viewBox={viewBox}>
				<path d="M16.24,10.76a1.63,1.63,0,0,0,1.2.49H27V34.31A1.67,1.67,0,0,1,25.31,36H1.69a1.67,1.67,0,0,1-1.2-.49A1.63,1.63,0,0,1,0,34.31V1.69A1.63,1.63,0,0,1,.49.49,1.67,1.67,0,0,1,1.69,0H15.75V9.56A1.63,1.63,0,0,0,16.24,10.76ZM20,17.09a.85.85,0,0,0,0-.92.79.79,0,0,0-.73-.42H16.8a.73.73,0,0,0-.7.42L13.5,21c-.42-.93-.8-1.68-1.12-2.25l-1.48-2.6a.73.73,0,0,0-.7-.42H7.73A.88.88,0,0,0,7,17.09l4.22,6.53L7,30.23a.74.74,0,0,0,0,.85.79.79,0,0,0,.73.42H10.2a.73.73,0,0,0,.7-.42l1.33-2.32,1.27-2.53,2.6,4.85a.73.73,0,0,0,.7.42h2.47a.79.79,0,0,0,.73-.42.85.85,0,0,0,0-.92l-4.22-6.54L20,17Zm6.54-9.71L19.62.49A1.67,1.67,0,0,0,18.42,0H18V9h9V8.58A1.67,1.67,0,0,0,26.51,7.38Z" />
			</SvgIcon>
		);
	}),
);

/**
 * A spreadsheet (Excel) file, a page with an "X". The DataGrid action bar
 * shows it on its Export button and its Export menu entry.
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
export default React.memo(ExportIcon) as unknown as SvgIconComponent;
