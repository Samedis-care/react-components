import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo, useRef } from "react";
import { ErrorOutlined, InfoOutlined, ReportProblemOutlined, TaskAlt, } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, accordionSummaryClasses, styled, Typography, useThemeProps, } from "@mui/material";
import { useControlled } from "@mui/material/utils";
import { useTranslation } from "react-i18next";
import combineClassNames from "../../utils/combineClassNames";
import ccI18n from "../../i18n";
import visuallyHidden from "../../utils/internal/visuallyHidden";
/**
 * InfoBox never suspended, and the status it reads out is only heard: while
 * the translations load it uses the English defaults, then re-renders, like the
 * Loader's non-suspending options
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };
/**
 * The box. MUI's Accordion styles accordions as a group: it rounds only the
 * top corners of the first of its element type among its siblings and the
 * bottom corners of the last. Every InfoBox is rounded on all four corners
 * instead, and clips its header to them.
 */
const AccordionStyled = styled(Accordion, { name: "CcInfoBox", slot: "root" })(({ theme }) => ({
    boxShadow: "none",
    "&.MuiAccordion-rounded": {
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden",
    },
}));
// state classes of the root and the header, see InfoBoxClassKey
const STATUS_CLASSES = {
    info: "CcInfoBox-statusInfo",
    warning: "CcInfoBox-statusWarning",
    success: "CcInfoBox-statusSuccess",
    error: "CcInfoBox-statusError",
};
const ALWAYS_EXPANDED_CLASS = "CcInfoBox-alwaysExpanded";
// The header's colors, set by its status class. The header's own declarations
// read them, so a background or color in the theme's summary override, which
// comes after them, replaces them for every status.
const HEADER_BACKGROUND = "--cc-info-box-header-background";
const HEADER_COLOR = "--cc-info-box-header-color";
/**
 * The header's colors for one status
 * @param color The palette color of the status
 * @returns The custom properties the header's colors read
 */
const headerColors = (color) => ({
    [HEADER_BACKGROUND]: color.main,
    [HEADER_COLOR]: color.contrastText,
});
/**
 * The look of the header, the same for the toggle and for the static header
 * of a forced box: its height and its status colors
 * @param theme The theme
 * @returns The styles of the header
 */
const headerStyles = (theme) => ({
    // a stacking context for the icon column (zIndex -1), so the column is
    // drawn over the header's background, and the focus ring over the column
    // instead of under its shade
    isolation: "isolate",
    minHeight: 48,
    backgroundColor: `var(${HEADER_BACKGROUND})`,
    color: `var(${HEADER_COLOR})`,
    [`&.${STATUS_CLASSES.info}`]: headerColors(theme.palette.primary),
    [`&.${STATUS_CLASSES.error}`]: headerColors(theme.palette.error),
    [`&.${STATUS_CLASSES.warning}`]: headerColors(theme.palette.warning),
    [`&.${STATUS_CLASSES.success}`]: headerColors(theme.palette.success),
});
/**
 * The keyboard focus ring of the header, 2px inside its edges, see the
 * toggle's focus rule
 */
const HEADER_FOCUS_RING = {
    outline: "2px solid currentColor",
    outlineOffset: -4,
};
const AccordionSummaryStyled = styled(AccordionSummary, {
    name: "CcInfoBox",
    slot: "summary",
})(({ theme }) => ({
    ...headerStyles(theme),
    // MUI's content wrapper (and the summaryRoot in it) is never wider than
    // the header: the heading wraps anywhere, and heading content that cannot
    // wrap (e.g. `white-space: nowrap`) runs past the header's end, where the
    // root clips it. Otherwise the wrapper grew to that content's width, and
    // the header button, which centers its content, cut off the heading's
    // start under the icon column.
    [`& .${accordionSummaryClasses.content}`]: {
        minWidth: 0,
    },
    // A keyboard-focused header keeps its status color, where MUI's
    // AccordionSummary would replace the background with
    // `palette.action.focus`, and shows a 2px outline in the text color, 2px
    // inside its edges: the text color contrasts with the status color as the
    // heading does (`palette.primary.main` would vanish on the info header),
    // the status color around it sets it off from the page, the root's
    // `overflow: hidden` cannot clip it, and forced colors keep outlines. It
    // also replaces the ring of the theme's `focusVisible` option, which the
    // root would clip.
    [`&.${accordionSummaryClasses.focusVisible}`]: {
        backgroundColor: `var(${HEADER_BACKGROUND})`,
        ...HEADER_FOCUS_RING,
    },
}));
/**
 * The header of a forced box (`alwaysExpanded`): the toggle's look without the
 * button, so it is no tab stop, has no `aria-expanded`, and the heading can be
 * selected and copied. It lays out its content as MUI's `AccordionSummary`
 * and its content wrapper do: 16px at the sides, at least 12px above and
 * below, centered vertically. A `span`, as the box's heading element around
 * it (`headingComponent`) takes phrasing content. It is focusable but no tab
 * stop (`tabIndex` -1), so it can take over the keyboard focus from the
 * toggle when the box becomes forced.
 */
const StaticHeader = styled("span", { name: "CcInfoBox", slot: "summary" })(({ theme }) => ({
    ...headerStyles(theme),
    // the containing block of the icon column
    position: "relative",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    padding: theme.spacing(1.5, 2),
    textAlign: "start",
    "&:focus-visible": HEADER_FOCUS_RING,
}));
// A `span`, as all of the header's content: the toggle is a button, which
// holds only phrasing content
const SummaryRoot = styled("span", { name: "CcInfoBox", slot: "summaryRoot" })(({ theme }) => ({
    display: "block",
    margin: 0,
    paddingLeft: theme.spacing(5),
    // never wider than the header, see the summary's content wrapper
    minWidth: 0,
}));
/**
 * The heading's text. It is a `span` in every Typography variant (see
 * `headingVariant`), as the header's content takes phrasing content only and
 * the box's heading is the element around the header. The `component` it
 * takes is passed on to `Typography`.
 */
const SummaryHeading = styled(Typography, {
    name: "CcInfoBox",
    slot: "heading",
})({
    // a block in every variant: its lines are as high as its variant's line
    // height, in both headers. Inline, it would share each line with the
    // header's content (summaryRoot), whose line height is the page's in the
    // static header (e.g. 24px under CssBaseline).
    display: "block",
    // a word wider than the header (a long compound, a file name or a URL on a
    // phone) breaks inside, so it stays in the box, which clips its content
    overflowWrap: "anywhere",
});
/**
 * The status name in front of the heading, with the separator the translation
 * carries. It is only read out and visually hidden (`statusName` slot): the
 * header announces "Warning: Please review", where the icon and the color
 * would be the only sign of the status.
 */
const StatusName = styled("span", {
    name: "CcInfoBox",
    slot: "statusName",
})(visuallyHidden);
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
    // a word wider than the panel (a long compound, a file name or a URL on a
    // phone) breaks inside, so it stays in the box, which clips its content,
    // also where the box sits in a flex row or a grid cell
    overflowWrap: "anywhere",
}));
const DetailsText = styled("div", { name: "CcInfoBox", slot: "detailsText" })({});
/**
 * The translated name of a status for the header, with the separator the
 * translation carries (so a locale can set it). `undefined` for `info` and an
 * unset status: they are the neutral default, so announcing "Info" on every
 * notice would only add noise.
 * @param status The `status` prop
 * @param t The library's translate function
 * @returns The status name and separator, or `undefined` when the status is
 * not announced
 */
const statusName = (status, t) => {
    switch (status) {
        case "warning":
            return t("standalone.info-box.status.warning", {
                defaultValue: "Warning:",
            });
        case "success":
            return t("standalone.info-box.status.success", {
                defaultValue: "Success:",
            });
        case "error":
            return t("standalone.info-box.status.error", {
                defaultValue: "Error:",
            });
        default:
            return undefined;
    }
};
const InfoBox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcInfoBox" });
    const { heading, onChange, expanded: expandedProp, defaultExpanded = false, alwaysExpanded, message, status, headingVariant, headingComponent = "h3", className, classes, } = props;
    const { t } = useTranslation("translation", TRANSLATION_OPTIONS);
    // The header announces the status in front of the heading, so a screen
    // reader gets what sighted users read from the color and the icon.
    const statusLabel = statusName(status, t);
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
    // the state classes of the root and the header, see InfoBoxClassKey
    const stateClasses = combineClassNames([
        STATUS_CLASSES[status ?? "info"],
        alwaysExpanded && ALWAYS_EXPANDED_CLASS,
    ]);
    const handleChange = useCallback((event, newExpanded) => {
        setExpanded(newExpanded);
        onChange?.(event, newExpanded);
    }, [onChange, setExpanded]);
    // The header that has keyboard focus keeps it when alwaysExpanded replaces
    // the toggle with the static header, or back: the header that unmounts
    // notes that it had focus, the one that mounts takes it.
    const headerElement = useRef(null);
    const headerHadFocus = useRef(false);
    const headerRef = useCallback((element) => {
        if (element) {
            headerElement.current = element;
            if (headerHadFocus.current) {
                headerHadFocus.current = false;
                element.focus();
            }
            return;
        }
        const previous = headerElement.current;
        headerHadFocus.current =
            !!previous && previous.contains(previous.ownerDocument.activeElement);
        headerElement.current = null;
    }, []);
    // the element of MUI's heading slot, which holds the header
    const accordionSlotProps = useMemo(() => ({ heading: { component: headingComponent } }), [headingComponent]);
    const headerClassName = combineClassNames([classes?.summary, stateClasses]);
    const headerContent = (_jsxs(SummaryRoot, { className: classes?.summaryRoot, children: [_jsx(SpanIconButton, { className: classes?.iconButton, children: getIcon() }), _jsxs(SummaryHeading, { variant: headingVariant ?? "caption", 
                // the variant sets only the look, see headingVariant
                component: "span", className: classes?.heading, children: [statusLabel && (_jsxs(_Fragment, { children: [_jsx(StatusName, { className: classes?.statusName, children: statusLabel }), " "] })), heading] })] }));
    return (_jsxs(AccordionStyled, { className: combineClassNames([className, classes?.root, stateClasses]), 
        // opening the box keeps the header at 48px and adds no margin around
        // the box, where MUI's gutters grow both
        disableGutters: true, expanded: !!alwaysExpanded || !!expanded, onChange: handleChange, slotProps: accordionSlotProps, children: [alwaysExpanded ? (_jsx(StaticHeader, { ref: headerRef, tabIndex: -1, 
                // MUI's state class of an open header, as the toggle has it
                className: combineClassNames([
                    headerClassName,
                    accordionSummaryClasses.expanded,
                ]), children: headerContent })) : (_jsx(AccordionSummaryStyled, { ref: headerRef, className: headerClassName, children: headerContent })), _jsx(AccordionDetailsStyled, { className: classes?.details, children: _jsx(DetailsText, { className: classes?.detailsText, children: message }) })] }));
};
export default React.memo(InfoBox);
