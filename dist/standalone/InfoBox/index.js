import React, { useCallback } from "react";
import { ErrorOutlined, InfoOutlined, ReportProblemOutlined, } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, styled, Typography, useThemeProps, } from "@mui/material";
import SuccessOutlinedIcon from "../Icons/SuccessOutlinedIcon";
import combineClassNames from "../../utils/combineClassNames";
const AccordionStyled = styled(Accordion, { name: "CcInfoBox", slot: "root" })({
    boxShadow: "none",
    "&.MuiAccordion-rounded": {
        overflow: "hidden",
    },
});
const AccordionSummaryStyled = styled(AccordionSummary, {
    name: "CcInfoBox",
    slot: "summary",
})(({ theme, ownerState: { status, alwaysExpanded } }) => ({
    minHeight: 48,
    "&.Mui-expanded": {
        minHeight: 48,
    },
    "&.MuiAccordionSummary-content": {
        "&.Mui-expanded": {
            margin: "12px 0",
        },
    },
    ...(alwaysExpanded && {
        cursor: "default",
        "&:hover:not(.Mui-disabled)": {
            cursor: "default",
        },
    }),
    ...((status == null || status === "info") && {
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    }),
    ...(status === "error" && {
        backgroundColor: theme.palette.error.main,
        borderColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
    }),
    ...(status === "warning" && {
        backgroundColor: theme.palette.warning.main,
        borderColor: theme.palette.warning.main,
        color: theme.palette.warning.contrastText,
    }),
    ...(status === "success" && {
        backgroundColor: theme.palette.success.main,
        borderColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
    }),
}));
const SummaryRoot = styled("div", { name: "CcInfoBox", slot: "summaryRoot" })(({ theme }) => ({
    margin: 0,
    paddingLeft: theme.spacing(5),
}));
const SummaryHeading = styled(Typography, {
    name: "CcInfoBox",
    slot: "heading",
})({});
const SpanIconButton = styled("span", {
    name: "CcInfoBox",
    slot: "iconButton",
})(({ theme }) => ({
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    backgroundColor: "rgba(0,0,0,.2)",
    width: theme.spacing(6),
}));
const AccordionDetailsStyled = styled(AccordionDetails, {
    name: "CcInfoBox",
    slot: "details",
})(({ theme }) => ({
    border: "1px solid grey",
    borderRadius: `0px 0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    padding: "8px 24px",
    whiteSpace: "pre-line",
}));
const DetailsText = styled("div", { name: "CcInfoBox", slot: "detailsText" })({});
// .MuiAccordionSummary-content.Mui-expanded => margin => unset
// .MuiAccordionSummary-root.Mui-expanded => min-height => unset
const InfoBox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcInfoBox" });
    const { heading, onChange, expanded, alwaysExpanded, message, status, headingVariant, className, classes, } = props;
    const getIcon = useCallback(() => {
        switch (status) {
            case "warning":
                return React.createElement(ReportProblemOutlined, null);
            case "success":
                return React.createElement(SuccessOutlinedIcon, null);
            case "error":
                return React.createElement(ErrorOutlined, null);
            default:
                return React.createElement(InfoOutlined, null);
        }
    }, [status]);
    return (React.createElement(AccordionStyled, { className: combineClassNames([className, classes?.root]), defaultExpanded: expanded, expanded: alwaysExpanded, onChange: onChange },
        React.createElement(AccordionSummaryStyled, { ownerState: { status, alwaysExpanded: !!alwaysExpanded }, className: classes?.summary },
            React.createElement(SummaryRoot, { className: classes?.summaryRoot },
                React.createElement(SpanIconButton, { className: classes?.iconButton }, getIcon()),
                React.createElement(SummaryHeading, { variant: headingVariant ?? "caption", className: classes?.heading }, heading))),
        React.createElement(AccordionDetailsStyled, { className: classes?.details },
            React.createElement(DetailsText, { className: classes?.detailsText }, message))));
};
export default React.memo(InfoBox);
