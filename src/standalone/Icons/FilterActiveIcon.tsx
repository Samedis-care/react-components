import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

const FilterActiveIcon = (props: SvgIconProps) => (
	<SvgIcon {...props} viewBox="0 0 25.98 26.09">
		<path d="M25.76,6.47A.7.7,0,0,1,26,7a.77.77,0,0,1-.22.54L25.25,8a.8.8,0,0,1-.54.21A.72.72,0,0,1,24.19,8L21.85,5.7,19.51,8a.72.72,0,0,1-.52.21A.8.8,0,0,1,18.45,8l-.51-.52A.77.77,0,0,1,17.72,7a.7.7,0,0,1,.22-.51l2.34-2.35L17.94,1.78a.7.7,0,0,1-.22-.51.77.77,0,0,1,.22-.54l.51-.52A.8.8,0,0,1,19,0a.72.72,0,0,1,.52.21l2.34,2.34L24.19.21A.72.72,0,0,1,24.71,0a.8.8,0,0,1,.54.21l.51.52a.77.77,0,0,1,.22.54.7.7,0,0,1-.22.51L23.42,4.12Z" />
		<path d="M10,.07H1.22A1.18,1.18,0,0,0,.36.42,1.19,1.19,0,0,0,0,1.29a1.18,1.18,0,0,0,.36.86l9.39,9.39V22a1.25,1.25,0,0,0,.51,1l4.06,2.84a1.19,1.19,0,0,0,1.27.08,1.13,1.13,0,0,0,.66-1.09V11.54L18.69,9.1Z" />
	</SvgIcon>
);

export default React.memo(FilterActiveIcon);
