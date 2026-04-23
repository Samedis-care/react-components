import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import SignalPortletItem from "./SignalPortletItem";
import { Divider, Grid, IconButton, List, Paper, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import { Sync as RefreshIcon } from "@mui/icons-material";
import timestampToAge from "../../utils/timestampToAge";
import useCCTranslations from "../../utils/useCCTranslations";
import useCurrentLocale from "../../utils/useCurrentLocale";
import combineClassNames from "../../utils/combineClassNames";
const SignalPortletRoot = styled("div", {
    name: "CcSignalPortlet",
    slot: "root",
})({});
const SignalPortletPaper = styled(Paper, {
    name: "CcSignalPortlet",
    slot: "paper",
})({
    height: "100%",
});
const SignalPortletInnerContainer = styled(Grid, {
    name: "CcSignalPortlet",
    slot: "innerContainer",
})({ height: "100%" });
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
const SignalPortletRefreshIconButton = styled(IconButton, {
    name: "CcSignalPortlet",
    slot: "refreshIconButton",
})({});
const SignalPortletRefreshIcon = styled(RefreshIcon, {
    name: "CcSignalPortlet",
    slot: "refreshIcon",
})({});
const SignalPortletLastUpdatedAt = styled("span", {
    name: "CcSignalPortlet",
    slot: "lastUpdatedAt",
})({});
const SignalPortlet = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcSignalPortlet" });
    const { t } = useCCTranslations();
    const locale = useCurrentLocale();
    return (_jsx(SignalPortletRoot, { className: combineClassNames([props.className, props.classes?.root]), children: _jsx(SignalPortletPaper, { className: props.classes?.paper, children: _jsxs(SignalPortletInnerContainer, { container: true, spacing: 1, sx: { flexDirection: "column", justifyContent: "space-between" }, wrap: "nowrap", className: props.classes?.innerContainer, children: [_jsxs(Grid, { container: true, spacing: 1, sx: { flexDirection: "column", justifyContent: "flex-start" }, wrap: "nowrap", size: "grow", children: [_jsx(SignalPortletTitleWrapper, { className: props.classes?.titleWrapper, children: _jsx(SignalPortletTitle, { variant: "h5", align: "center", className: props.classes?.title, children: props.title }) }), _jsx(SignalPortletDivider, { className: props.classes?.divider, children: _jsx(Divider, {}) }), _jsx(Grid, { children: _jsx(SignalPortletList, { className: props.classes?.list, children: props.items.map((item, index) => (_jsx(SignalPortletItemStyled, { className: props.classes?.item, ...item }, index.toString()))) }) })] }), (props.updatedAt || props.onRefresh) && (_jsxs(Grid, { container: true, spacing: 1, sx: {
                            justifyContent: "flex-end",
                            alignItems: "center",
                            alignContent: "center",
                        }, children: [props.updatedAt && (_jsx(Grid, { children: _jsx(Tooltip, { title: new Date(props.updatedAt).toLocaleString(locale), children: _jsx(SignalPortletLastUpdatedAt, { children: t("standalone.signal-portlet.last-updated", {
                                            AGE: timestampToAge(new Date(props.updatedAt)),
                                        }) }) }) })), props.onRefresh && (_jsx(Grid, { children: _jsx(SignalPortletRefreshIconButton, { onClick: props.onRefresh, size: "small", color: "primary", "aria-label": t("standalone.signal-portlet.refresh"), children: _jsx(SignalPortletRefreshIcon, {}) }) }))] }))] }) }) }));
};
export default React.memo(SignalPortlet);
