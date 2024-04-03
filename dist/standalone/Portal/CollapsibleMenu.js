import React, { useCallback, useState } from "react";
import { Grid, IconButton, styled, useThemeProps } from "@mui/material";
import { DoubleArrow } from "@mui/icons-material";
import { usePortalLayoutContext } from "./Layout";
import combineClassNames from "../../utils/combineClassNames";
const Root = styled(Grid, { name: "CcCollapsibleMenu", slot: "root" })({
    width: "100%",
    height: "100%",
    overflow: "auto",
});
const Content = styled(Grid, { name: "CcCollapsibleMenu", slot: "content" })({
    "& > div": {
        overflow: "unset",
    },
});
const Bar = styled(Grid, { name: "CcCollapsibleMenu", slot: "bar" })({
    position: "sticky",
    top: 0,
});
const IconOpen = styled(DoubleArrow, {
    name: "CcCollapsibleMenu",
    slot: "iconOpen",
})({});
const IconClose = styled(DoubleArrow, {
    name: "CcCollapsibleMenu",
    slot: "iconClose",
})({
    transform: "rotate(180deg)",
});
const StyledButton = styled(IconButton, {
    name: "CcCollapsibleMenu",
    slot: "button",
})({});
const CollapsibleMenu = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcCollapsibleMenu" });
    const { classes, className } = props;
    const [collapsed, setCollapsed] = useState(false);
    const { mobile } = usePortalLayoutContext();
    const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), [setCollapsed]);
    const ArrowComp = collapsed ? IconOpen : IconClose;
    return (React.createElement(Root, { container: true, justifyContent: "flex-start", alignItems: "stretch", wrap: "nowrap", style: collapsed ? { overflow: "visible" } : undefined, className: combineClassNames([className, classes?.root]) },
        React.createElement(Content, { item: true, xs: true, style: { width: props.width, display: collapsed ? "none" : undefined }, className: classes?.content, key: "content" }, props.children),
        !mobile && (React.createElement(Bar, { item: true, key: "bar", className: classes?.bar },
            React.createElement(StyledButton, { onClick: toggleCollapsed, className: classes?.button, size: "large" },
                React.createElement(ArrowComp, { className: collapsed ? classes?.iconOpen : classes?.iconClose }))))));
};
export default React.memo(CollapsibleMenu);
