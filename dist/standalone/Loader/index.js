import React from "react";
import { CircularProgress, styled, Typography, useThemeProps, } from "@mui/material";
const OuterWrapper = styled("div", { name: "CcLoader", slot: "outerWrapper" })({
    height: "100%",
    position: "relative",
    width: "100%",
});
const InnerWrapper = styled("div", { name: "CcLoader", slot: "innerWrapper" })({
    height: 70,
    left: "50%",
    position: "absolute",
    textAlign: "center",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
});
const OuterProgressWrapper = styled("div", {
    name: "CcLoader",
    slot: "outerProgressWrapper",
})({
    height: "100%",
    position: "relative",
    width: "100%",
});
const InnerProgressWrapper = styled("div", {
    name: "CcLoader",
    slot: "innerProgressWrapper",
})({
    left: "50%",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
});
const Progress = styled(CircularProgress, {
    name: "CcLoader",
    slot: "progress",
})({});
const Loader = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcLoader" });
    return (React.createElement(OuterWrapper, null,
        React.createElement(InnerWrapper, null,
            props.text && React.createElement(Typography, { variant: "h6" }, props.text),
            React.createElement(OuterProgressWrapper, null,
                React.createElement(InnerProgressWrapper, null,
                    React.createElement(Progress, null))))));
};
export default React.memo(Loader);
