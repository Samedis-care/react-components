import { styled, useThemeProps } from "@mui/material";
import React from "react";
import combineClassNames from "../../utils/combineClassNames";
const Root = styled("div", { name: "CcFormPageLayout", slot: "root" })({
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
});
const Wrapper = styled("div", { name: "CcFormPageLayout", slot: "wrapper" })({
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
});
const Body = styled("div", { name: "CcFormPageLayout", slot: "body" })({
    paddingBottom: 150,
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
});
const Footer = styled("div", { name: "CcFormPageLayout", slot: "footer" })({
    position: "absolute",
    bottom: 36,
    transform: "translateX(36px)",
    padding: 0,
});
const FormPageLayout = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormPageLayout" });
    const { body, footer, other, className, classes } = props;
    return (React.createElement(Root, { className: combineClassNames([className, classes?.root]) },
        React.createElement(Wrapper, { className: classes?.wrapper },
            React.createElement(Body, { className: classes?.body }, body),
            React.createElement(Footer, { className: classes?.footer }, footer)),
        other));
};
export default React.memo(FormPageLayout);
