import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import withMuiName from "./withMuiName";

// The 26x26.02 glyph fitted into Material's 18x18 square keyline and centered
// on its 24-unit grid, so it looks as large as a Material icon of the same size.
// The default: a caller's viewBox replaces it, as on a Material icon.
const VIEW_BOX = "-4.347 -4.337 34.693 34.693";

const FilterIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
	withMuiName(function FilterIcon({ viewBox = VIEW_BOX, ...props }, ref) {
		return (
			<SvgIcon {...props} ref={ref} viewBox={viewBox}>
				<path d="M25.64.36a1.15,1.15,0,0,1,.36.86,1.15,1.15,0,0,1-.36.86l-9.39,9.4v13.3a1.13,1.13,0,0,1-.66,1.09,1.19,1.19,0,0,1-1.27-.07L10.26,23a1.25,1.25,0,0,1-.51-1V11.48L.36,2.08A1.15,1.15,0,0,1,0,1.22,1.15,1.15,0,0,1,.36.36,1.15,1.15,0,0,1,1.22,0H24.78A1.15,1.15,0,0,1,25.64.36Z" />
			</SvgIcon>
		);
	}),
);

export default React.memo(FilterIcon) as unknown as SvgIconComponent;
