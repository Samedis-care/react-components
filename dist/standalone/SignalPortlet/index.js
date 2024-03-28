import React from "react";
import SignalPortletItem from "./SignalPortletItem";
import { Divider, Grid, List, Paper, styled, Typography, useThemeProps, } from "@mui/material";
const SignalPortletRoot = styled("div", {
    name: "CcSignalPortlet",
    slot: "paper",
})({});
const SignalPortletPaper = styled(Paper, {
    name: "CcSignalPortlet",
    slot: "paper",
})({
    height: "100%",
});
const SignalPortletDivider = styled(Grid, {
    name: "CcSignalPortlet",
    slot: "divider",
})({});
const SignalPortletTitleWrapper = styled(Grid, {
    name: "CcSignalPortlet",
    slot: "titleWrapper",
})({});
const SignalPortletTitle = styled(Typography, {
    name: "CcSignalPortlet",
    slot: "title",
})({});
const SignalPortletList = styled(List, {
    name: "CcSignalPortlet",
    slot: "list",
})({});
const SignalPortletItemStyled = styled(SignalPortletItem, {
    name: "CcSignalPortlet",
    slot: "item",
})({});
const SignalPortlet = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcSignalPortlet" });
    return (React.createElement(SignalPortletRoot, null,
        React.createElement(SignalPortletPaper, { className: props.classes?.paper },
            React.createElement(Grid, { container: true, spacing: 1 },
                React.createElement(SignalPortletTitleWrapper, { item: true, xs: 12, className: props.classes?.titleWrapper },
                    React.createElement(SignalPortletTitle, { variant: "h5", align: "center", className: props.classes?.title }, props.title)),
                React.createElement(SignalPortletDivider, { item: true, xs: 12, className: props.classes?.divider },
                    React.createElement(Divider, null)),
                React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement(SignalPortletList, { className: props.classes?.list }, props.items.map((item, index) => (React.createElement(SignalPortletItemStyled, { key: index.toString(), className: props.classes?.item, ...item })))))))));
};
export default React.memo(SignalPortlet);
