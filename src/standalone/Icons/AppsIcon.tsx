import React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

const AppsIcon = (props: SvgIconProps) => (
	<SvgIcon {...props} viewBox={"0 0 42.07 26.54"}>
		<rect x="31.22" width="10.85" height="10.85" rx="2.83" />
		<rect x="31.22" y="15.69" width="10.85" height="10.85" rx="2.83" />
		<rect x="15.91" width="10.85" height="10.85" rx="2.83" />
		<rect x="15.91" y="15.69" width="10.85" height="10.85" rx="2.83" />
		<rect width="10.85" height="10.85" rx="2.83" />
		<rect y="15.69" width="10.85" height="10.85" rx="2.83" />
	</SvgIcon>
);

export default React.memo(AppsIcon);
