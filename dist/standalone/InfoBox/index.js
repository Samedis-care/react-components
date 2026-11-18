import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { ErrorOutlined, InfoOutlined, ReportProblemOutlined, TaskAlt, } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses, styled, Typography, useThemeProps, } from "@mui/material";
import { useControlled } from "@mui/material/utils";
import combineClassNames from "../../utils/combineClassNames";
const AccordionStyled = styled(Accordion, { name: "CcInfoBox", slot: "root" })({
    boxShadow: "none",
    "&.MuiAccordion-rounded": {
        overflow: "hidden",
    },
});
/**
 * The header's colors for one status. A keyboard-focused header
 * (`Mui-focusVisible`) keeps them, where MUI's AccordionSummary would replace
 * the background with `palette.action.focus`, and shows a 2px outline in the
 * text color, 2px inside its edges: the text color contrasts with the status
 * color as the heading does (`palette.primary.main` would vanish on the info
 * header), the status color around it sets it off from the page, the root's
 * `overflow: hidden` cannot clip it, and forced colors keep outlines. It also
 * replaces the ring of the theme's `focusVisible` option, which the root
 * would clip.
 * @param color The palette color of the status
 * @returns The header's color styles
 */
const headerColors = (color) => ({
    backgroundColor: color.main,
    borderColor: color.main,
    color: color.contrastText,
    [`&.${accordionSummaryClasses.focusVisible}`]: {
        backgroundColor: color.main,
        outline: "2px solid currentColor",
        outlineOffset: -4,
    },
});
const AccordionSummaryStyled = styled(AccordionSummary, {
    name: "CcInfoBox",
    slot: "summary",
})(({ theme, ownerState: { status, alwaysExpanded } }) => ({
    // a stacking context for the icon column (zIndex -1), so the focus ring
    // is drawn over the column instead of under its shade
    isolation: "isolate",
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
    ...((status == null || status === "info") &&
        headerColors(theme.palette.primary)),
    ...(status === "error" && headerColors(theme.palette.error)),
    ...(status === "warning" && headerColors(theme.palette.warning)),
    ...(status === "success" && headerColors(theme.palette.success)),
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
    // below the header's focus ring (the header isolates it)
    zIndex: -1,
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
    const { heading, onChange, expanded: expandedProp, defaultExpanded = false, alwaysExpanded, message, status, headingVariant, className, classes, } = props;
    const getIcon = useCallback(() => {
        switch (status) {
            case "warning":
                return _jsx(ReportProblemOutlined, {});
            case "success":
                return _jsx(TaskAlt, {});
            case "error":
                return _jsx(ErrorOutlined, {});
            default:
                return _jsx(InfoOutlined, {});
        }
    }, [status]);
    // `expanded` when set, otherwise the state the user toggles, starting at
    // `defaultExpanded`. The Accordion is always controlled, with a boolean,
    // so `alwaysExpanded` can change after mount, and `expanded` can be
    // removed, without switching it between controlled and uncontrolled.
    const [expanded, setExpanded] = useControlled({
        controlled: expandedProp,
        default: defaultExpanded,
        name: "InfoBox",
        state: "expanded",
    });
    const handleChange = useCallback((event, newExpanded) => {
        setExpanded(newExpanded);
        onChange?.(event, newExpanded);
    }, [onChange, setExpanded]);
    return (_jsxs(AccordionStyled, { className: combineClassNames([className, classes?.root]), expanded: !!alwaysExpanded || !!expanded, onChange: handleChange, children: [_jsx(AccordionSummaryStyled, { ownerState: { status, alwaysExpanded: !!alwaysExpanded }, className: classes?.summary, children: _jsxs(SummaryRoot, { className: classes?.summaryRoot, children: [_jsx(SpanIconButton, { className: classes?.iconButton, children: getIcon() }), _jsx(SummaryHeading, { variant: headingVariant ?? "caption", className: classes?.heading, children: heading })] }) }), _jsx(AccordionDetailsStyled, { className: classes?.details, children: _jsx(DetailsText, { className: classes?.detailsText, children: message }) })] }));
};
export default React.memo(InfoBox);
