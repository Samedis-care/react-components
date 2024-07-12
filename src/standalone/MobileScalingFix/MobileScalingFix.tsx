import React, { useEffect } from "react";

export interface MobileScalingFixProps {
	minWidth?: number;
}

const MobileScalingFix = (props: MobileScalingFixProps) => {
	const { minWidth } = props;
	useEffect(() => {
		let meta: HTMLMetaElement | null = document.querySelector(
			"meta[name='viewport']",
		);
		let metaContent =
			"width=" +
			(minWidth ? minWidth.toFixed() : "device-width") +
			", initial-scale=1";
		if (
			["iPhone", "iPod"].find((device) => navigator.platform.includes(device))
		) {
			metaContent += ", maximum-scale=1"; // prevent scaling in on inputs
		}
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "viewport";
			document.head.appendChild(meta);
		}
		meta.content = metaContent;
	}, [minWidth]);

	return <></>;
};

export default React.memo(MobileScalingFix);
