import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    // Its own stacking context, so the footer, which floats over the body and comes
    // after it, paints above all of the body's content and gets every click in its
    // area: also content with a z-index of its own, such as outlined field labels,
    // badges or the DataGrid's settings panel. Unlike a z-index on the footer, this
    // leaves the footer below the busy overlay (`other`) and app-level layers.
    isolation: "isolate",
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
    return (_jsxs(Root, { className: combineClassNames([className, classes?.root]), children: [_jsxs(Wrapper, { className: classes?.wrapper, children: [_jsx(Body, { className: classes?.body, children: body }), _jsx(Footer, { className: classes?.footer, children: footer })] }), other] }));
};
export default React.memo(FormPageLayout);
