import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Grid, IconButton, styled, useThemeProps } from "@mui/material";
import { DoubleArrow } from "@mui/icons-material";
import { usePortalLayoutContext } from "./Layout";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";
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
    const { t } = useCCTranslations();
    const { mobile } = usePortalLayoutContext();
    const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), [setCollapsed]);
    const ArrowComp = collapsed ? IconOpen : IconClose;
    return (_jsxs(Root, { container: true, sx: { justifyContent: "flex-start", alignItems: "stretch" }, wrap: "nowrap", style: collapsed ? { overflow: "visible" } : undefined, className: combineClassNames([className, classes?.root]), children: [_jsx(Content, { size: "grow", style: { width: props.width, display: collapsed ? "none" : undefined }, className: classes?.content, children: props.children }, "content"), !mobile && (_jsx(Bar, { className: classes?.bar, children: _jsx(StyledButton, { onClick: toggleCollapsed, className: classes?.button, size: "large", "aria-label": collapsed
                        ? t("standalone.portal.expand-menu")
                        : t("standalone.portal.collapse-menu"), children: _jsx(ArrowComp, { className: collapsed ? classes?.iconOpen : classes?.iconClose }) }) }, "bar"))] }));
};
export default React.memo(CollapsibleMenu);
