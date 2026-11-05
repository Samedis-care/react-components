import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import withMuiName from "./withMuiName";

const AppsIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(
	withMuiName(function AppsIcon(props, ref) {
		return (
			<SvgIcon {...props} ref={ref} viewBox={"0 0 42.07 26.54"}>
				<rect x="31.22" width="10.85" height="10.85" rx="2.83" />
				<rect x="31.22" y="15.69" width="10.85" height="10.85" rx="2.83" />
				<rect x="15.91" width="10.85" height="10.85" rx="2.83" />
				<rect x="15.91" y="15.69" width="10.85" height="10.85" rx="2.83" />
				<rect width="10.85" height="10.85" rx="2.83" />
				<rect y="15.69" width="10.85" height="10.85" rx="2.83" />
			</SvgIcon>
		);
	}),
);

export default React.memo(AppsIcon) as unknown as SvgIconComponent;
