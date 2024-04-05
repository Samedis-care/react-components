import React from "react";
import { styled, Typography, useThemeProps, } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
const Root = styled("div", { name: "CcCenteredTypography", slot: "root" })({
    position: "relative",
    height: "100%",
    width: "100%",
});
const Inner = styled("div", { name: "CcCenteredTypography", slot: "inner" })({
    height: 70,
    left: "50%",
    position: "absolute",
    textAlign: "center",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
});
const StyledTypography = styled(Typography, {
    name: "CcCenteredTypography",
    slot: "typography",
})({});
const CenteredTypography = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcCenteredTypography" });
    const { className, classes, ...typographyProps } = props;
    return (React.createElement(Root, { className: combineClassNames([className, classes?.root]) },
        React.createElement(Inner, { className: classes?.inner },
            React.createElement(StyledTypography, { ...typographyProps, className: classes?.typography }))));
};
export default React.memo(CenteredTypography);
