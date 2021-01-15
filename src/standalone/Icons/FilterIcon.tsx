import React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

const FilterIcon = (props: SvgIconProps) => (
	<SvgIcon {...props} viewBox="0 0 26 26.02">
		<path d="M25.64.36a1.15,1.15,0,0,1,.36.86,1.15,1.15,0,0,1-.36.86l-9.39,9.4v13.3a1.13,1.13,0,0,1-.66,1.09,1.19,1.19,0,0,1-1.27-.07L10.26,23a1.25,1.25,0,0,1-.51-1V11.48L.36,2.08A1.15,1.15,0,0,1,0,1.22,1.15,1.15,0,0,1,.36.36,1.15,1.15,0,0,1,1.22,0H24.78A1.15,1.15,0,0,1,25.64.36Z" />
	</SvgIcon>
);

export default React.memo(FilterIcon);
