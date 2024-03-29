import React from "react";
import Loader from "../Loader";
import { styled, useThemeProps } from "@mui/material";

export interface FormLoaderOverlayRootOwnerState {
	visible: boolean;
}

const FormLoaderOverlayRoot = styled("div", {
	name: "CcFormLoaderOverlay",
	slot: "root",
})<{ ownerState: FormLoaderOverlayRootOwnerState }>(
	({ ownerState: { visible } }) => ({
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 9999,
		backgroundColor: "rgba(255,255,255,.3)",
		transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 1000ms",
		...(visible
			? { visibility: "visible", opacity: 1 }
			: { visibility: "hidden", opacity: 0 }),
	}),
);

const FormLoaderOverlayLoader = styled(Loader, {
	name: "CcFormLoaderOverlay",
	slot: "loader",
})({});

export type FormLoaderOverlayClassKey = "root" | "loader";

export interface FormLoaderOverlayProps {
	/**
	 * should the overlay be shown? will trigger fade-in, set to isSubmitting
	 */
	visible: boolean;
	/**
	 * custom styles applied to root
	 */
	className?: string;
}

const FormLoaderOverlay = (inProps: FormLoaderOverlayProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormLoaderOverlay" });

	return (
		<FormLoaderOverlayRoot
			ownerState={{ visible: props.visible }}
			className={props.className}
		>
			{props.visible && <FormLoaderOverlayLoader />}
		</FormLoaderOverlayRoot>
	);
};

export default React.memo(FormLoaderOverlay);
