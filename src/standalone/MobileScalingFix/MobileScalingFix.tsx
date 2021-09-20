import React, { useEffect } from "react";

const MobileScalingFix = () => {
	useEffect(() => {
		let meta: HTMLMetaElement | null = document.querySelector(
			"meta[name='viewport']"
		);
		let metaContent = "width=device-width, initial-scale=1";
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
	}, []);

	return <></>;
};

export default React.memo(MobileScalingFix);
