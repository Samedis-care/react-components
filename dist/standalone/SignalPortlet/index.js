import React from "react";
import SignalPortletItem from "./SignalPortletItem";
import { Divider, Grid, IconButton, List, Paper, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import { Sync as RefreshIcon } from "@mui/icons-material";
import timestampToAge from "../../utils/timestampToAge";
import useCCTranslations from "../../utils/useCCTranslations";
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
    const { t, i18n } = useCCTranslations();
    return (React.createElement(SignalPortletRoot, { className: combineClassNames([props.className, props.classes?.root]) },
        React.createElement(SignalPortletPaper, { className: props.classes?.paper },
            React.createElement(SignalPortletInnerContainer, { container: true, spacing: 1, direction: "column", justifyContent: "space-between", wrap: "nowrap" },
                React.createElement(Grid, { item: true, xs: true, container: true, spacing: 1, justifyContent: "flex-start", direction: "column", wrap: "nowrap" },
                    React.createElement(SignalPortletTitleWrapper, { item: true, className: props.classes?.titleWrapper },
                        React.createElement(SignalPortletTitle, { variant: "h5", align: "center", className: props.classes?.title }, props.title)),
                    React.createElement(SignalPortletDivider, { item: true, className: props.classes?.divider },
                        React.createElement(Divider, null)),
                    React.createElement(Grid, { item: true },
                        React.createElement(SignalPortletList, { className: props.classes?.list }, props.items.map((item, index) => (React.createElement(SignalPortletItemStyled, { key: index.toString(), className: props.classes?.item, ...item })))))),
                (props.updatedAt || props.onRefresh) && (React.createElement(Grid, { item: true, container: true, spacing: 1, justifyContent: "flex-end", alignItems: "center", alignContent: "center" },
                    props.updatedAt && (React.createElement(Grid, { item: true },
                        React.createElement(Tooltip, { title: new Date(props.updatedAt).toLocaleString(i18n.language) },
                            React.createElement(SignalPortletLastUpdatedAt, null, t("standalone.signal-portlet.last-updated", {
                                AGE: timestampToAge(new Date(props.updatedAt)),
                            }))))),
                    props.onRefresh && (React.createElement(Grid, { item: true },
                        React.createElement(SignalPortletRefreshIconButton, { onClick: props.onRefresh, size: "small", color: "primary" },
                            React.createElement(SignalPortletRefreshIcon, null))))))))));
};
export default React.memo(SignalPortlet);
