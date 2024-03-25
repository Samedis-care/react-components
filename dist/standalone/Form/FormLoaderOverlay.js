import React from "react";
import Loader from "../Loader";
import { styled, useThemeProps } from "@mui/material";
const FormLoaderOverlayRoot = styled("div", {
    name: "CcFormLoaderOverlay",
    slot: "root",
})(({ ownerState: { visible } }) => ({
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
}));
const FormLoaderOverlayLoader = styled(Loader, {
    name: "CcFormLoaderOverlay",
    slot: "loader",
})({});
const FormLoaderOverlay = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormLoaderOverlay" });
    return (React.createElement(FormLoaderOverlayRoot, { ownerState: { visible: props.visible }, className: props.className }, props.visible && React.createElement(FormLoaderOverlayLoader, null)));
};
export default React.memo(FormLoaderOverlay);
