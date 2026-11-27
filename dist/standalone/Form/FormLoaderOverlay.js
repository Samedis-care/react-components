import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useId, useLayoutEffect, useRef } from "react";
import { alpha, circularProgressClasses, styled, useThemeProps, } from "@mui/material";
import { useTranslation } from "react-i18next";
import Loader from "../Loader";
import ccI18n from "../../i18n";
import combineClassNames from "../../utils/combineClassNames";
import visuallyHidden from "../../utils/internal/visuallyHidden";
/**
 * State class of the root while the overlay is visible
 */
const VISIBLE_CLASS = "CcFormLoaderOverlay-visible";
/**
 * How long the wash's color and spinner stay transparent after every show before they
 * fade in, in ms: a busy phase shorter than that never paints them
 */
const SHOW_DELAY = 1000;
/**
 * What MUI keeps off the DOM of a root slot, plus the overlay's `visible`
 */
const ROOT_PROPS_NOT_FORWARDED = new Set([
    "visible",
    "ownerState",
    "theme",
    "sx",
    "as",
    "classes",
]);
const FormLoaderOverlayRoot = styled("div", {
    name: "CcFormLoaderOverlay",
    slot: "root",
    shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
})(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // above the content it covers, also content with a z-index of its own, and below
    // the lowest of the theme's app-level layers (mobile stepper, fab, speed dial,
    // app bar, drawer, modal, snackbar, tooltip), so that dialogs, menus, snackbars
    // and tooltips opened while it is shown stay above the wash and can be used
    zIndex: theme.zIndex.mobileStepper - 1,
    // the spinner's line (loaderAnchor) rests in the middle; the padding, half the
    // Loader's height (a 40px spinner with theme.spacing(2) above and below), keeps
    // the spinner inside the wash wherever the line is moved to
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: `calc(${theme.spacing(2)} + 20px) 0`,
    // the page's surface, see-through: it lightens the content of a light theme and
    // dims that of a dark one
    backgroundColor: alpha(theme.palette.background.paper, 0.3),
    // keyboard focus that the overlay takes from the content it wraps; inside the
    // wash, so that a container that clips its overflow does not cut it off. It shows
    // as soon as the wash has the focus, also before the wash fades in: what fades is
    // the wash's paint, not the root
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
    // The hidden and the shown state. :where() keeps their rules at zero specificity,
    // so that the theme's styleOverrides and variants (keyed on `visible`) win over
    // them, as over the root's other styles. The leading * stops emotion from reading
    // the selector as a pseudo-class of the root.
    // Hidden, the wash's color and the spinner's line (the root's one child) are
    // transparent, where every fade-in starts. The color is important: the fade starts
    // from transparent whatever color the theme gives the wash, also in the root's
    // override, which would win over it otherwise
    [`*:where(&:not(.${VISIBLE_CLASS}))`]: {
        visibility: "hidden",
        backgroundColor: "transparent !important",
        "& > *": { opacity: 0 },
    },
    // Shown, the wash blocks the pointer and takes the focus at once, and its paint (its
    // color and the spinner's line) fades in after SHOW_DELAY, so that a shorter busy
    // phase never paints it; the root itself does not fade, so that its focus ring shows
    // at once. Every show starts from transparent: the shown state alone has the
    // transition, so hiding drops the paint at once and a show right after it fades in
    // late again, and @starting-style gives the transition its start on an overlay
    // mounted shown (a browser without it shows that one at once; important, as above).
    // The spinner's line takes the root's transition (inherit), which names opacity for
    // it: a theme that changes the root's transition, such as `none` in a variant on
    // `visible`, changes the spinner's with it
    [`*:where(&.${VISIBLE_CLASS})`]: {
        visibility: "visible",
        transition: theme.transitions.create(["background-color", "opacity"], {
            duration: theme.transitions.duration.enteringScreen,
            easing: theme.transitions.easing.easeInOut,
            delay: SHOW_DELAY,
        }),
        "@starting-style": { backgroundColor: "transparent !important" },
        "& > *": {
            transition: "inherit",
            "@starting-style": { opacity: 0 },
        },
    },
}));
const FormLoaderOverlayLoaderAnchor = styled("div", {
    name: "CcFormLoaderOverlay",
    slot: "loaderAnchor",
})({
    // a line that stays in the middle of the visible area of the nearest scroll
    // container (or the viewport) as far as the overlay reaches; the spinner is
    // centered on it, so it stays in view on an overlay taller than what is shown of it
    position: "sticky",
    top: "50%",
    bottom: "50%",
    height: 0,
});
const FormLoaderOverlayLoader = styled(Loader, {
    name: "CcFormLoaderOverlay",
    slot: "loader",
})(({ theme }) => ({
    // the spinner sits on a disc of its own, paper with the edge of an outlined Paper, so
    // that it keeps its contrast over whatever lies under the wash, also a primary-colored
    // button, tab or banner. The disc reaches theme.spacing(1) beyond the spinner, into
    // the space the Loader keeps above and below it, and leaves the Loader's size as it
    // is. It is the spinner's own box, which turns: disc and edge are even all around, so
    // that the turning does not show, and the edge is a shadow, which takes no room
    [`& .${circularProgressClasses.root}`]: {
        boxSizing: "content-box",
        padding: theme.spacing(1),
        margin: theme.spacing(-1),
        borderRadius: "50%",
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 1px ${theme.palette.divider}`,
    },
}));
const FormLoaderOverlayContainer = styled("div", {
    name: "CcFormLoaderOverlay",
    slot: "container",
})({
    // the containing block of the wash: it covers the wrapped content, and nothing
    // outside it
    position: "relative",
});
const FormLoaderOverlayContent = styled("div", {
    name: "CcFormLoaderOverlay",
    slot: "content",
})({});
// the status message: outside the wash, which is `visibility: hidden` while the overlay
// is idle and would take it out of the accessibility tree, so that it stays the same
// element in the tree and only its text changes (a live region that appears together
// with its text is not announced by every screen reader). Visually hidden inside the
// area the wash covers, in its top left corner, so that it makes no page scroll in
// either direction
const FormLoaderOverlayStatus = styled("div", {
    name: "CcFormLoaderOverlay",
    slot: "status",
})(visuallyHidden);
/**
 * The default status message while the library's translations are still loading
 */
const DEFAULT_MESSAGE = "Loading…";
/**
 * The overlay does not suspend, like the Loader it shows: until the translations have
 * loaded it uses {@link DEFAULT_MESSAGE}, then re-renders
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };
const FormLoaderOverlay = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormLoaderOverlay" });
    const { visible, className, classes, message, children } = props;
    const wraps = children !== undefined;
    const { t, ready } = useTranslation("translation", TRANSLATION_OPTIONS);
    const statusMessage = message || (ready ? t("standalone.loader.label") : DEFAULT_MESSAGE);
    const statusId = useId();
    const rootRef = useRef(null);
    const contentRef = useRef(null);
    // the element in the content that had keyboard focus when the overlay was shown
    const returnFocusRef = useRef(null);
    // The wrapped content is inert while the overlay is visible: set on the DOM, as
    // React 18 and 19 take the `inert` prop differently. Focus is moved out of the
    // content before it turns inert, as the browser would drop it to the page. Both
    // happen in the effect, not in a cleanup: React puts back the focus that changes
    // while it applies a commit to the DOM, which is when cleanups run
    useLayoutEffect(() => {
        const root = rootRef.current;
        const content = contentRef.current;
        if (!root || !content)
            return;
        const doc = content.ownerDocument;
        if (visible) {
            const active = doc.activeElement;
            if (active && content.contains(active)) {
                returnFocusRef.current = active;
                root.focus({ preventScroll: true });
            }
            content.setAttribute("inert", "");
            return;
        }
        content.removeAttribute("inert");
        const returnFocus = returnFocusRef.current;
        returnFocusRef.current = null;
        if (!returnFocus?.isConnected)
            return;
        const now = doc.activeElement;
        // focus moved out of the wash meanwhile stays where it is
        if (now && now !== root && now !== doc.body)
            return;
        returnFocus.focus();
    }, [visible, wraps]);
    // the status region below is the overlay's one status: the Loader in the wash is no
    // status region of its own, and the message names its spinner
    const overlay = (_jsx(FormLoaderOverlayRoot, { ref: rootRef, tabIndex: wraps ? -1 : undefined, visible: visible, className: combineClassNames([
            className,
            classes?.root,
            visible && VISIBLE_CLASS,
        ]), children: _jsx(FormLoaderOverlayLoaderAnchor, { className: classes?.loaderAnchor, children: visible && (_jsx(FormLoaderOverlayLoader, { role: "none", "aria-labelledby": statusId, className: classes?.loader })) }) }));
    const status = (_jsx(FormLoaderOverlayStatus, { id: statusId, role: "status", "aria-busy": false, className: classes?.status, children: visible ? statusMessage : "" }));
    if (!wraps)
        return (_jsxs(_Fragment, { children: [overlay, status] }));
    return (_jsxs(FormLoaderOverlayContainer, { className: classes?.container, children: [_jsx(FormLoaderOverlayContent, { ref: contentRef, "aria-busy": visible || undefined, className: classes?.content, children: children }), overlay, status] }));
};
/**
 * Busy overlay: a translucent wash with a spinner on a disc over the nearest positioned
 * ancestor (`position: absolute`, `inset: 0`), or, with `children`, over them.
 * BasicFormPage shows it over the form page while the form is submitting, through
 * FormPageLayout's `other`, which makes it cover the form layout.
 *
 * The wash is the theme's `palette.background.paper` at 30% opacity: it lightens the
 * content under it in a light theme and dims it in a dark one.
 *
 * Timing: the wash fades in 1s after every show, also when the overlay is mounted
 * shown, so that a short busy phase never flashes it, with the theme's transitions;
 * hiding is at once (see {@link FormLoaderOverlayProps.visible}). To show a spinner at
 * once, such as the whole content of a view while it loads, use a Loader instead.
 *
 * Input: the wash alone blocks pointer input only. The controls under it stay
 * reachable with Tab and operable by keyboard: disable them while it is shown, or pass
 * them as `children`, which makes them `inert` while it is shown, so that neither
 * pointer nor keyboard reaches them; keyboard focus in them moves to the wash, which
 * shows its focus ring at once, and back (see
 * {@link FormLoaderOverlayProps.children}). In a form page, Form makes its fields and
 * buttons read-only while it is busy (Save stays focusable as an `aria-disabled`
 * button); controls of the page that do not follow the form's read-only state stay
 * operable by keyboard under the wash. With no positioned ancestor, the wash covers the
 * initial viewport, and the page under it stays operable by keyboard.
 *
 * Accessibility: the overlay is a polite status message. Its status region
 * (`role="status"`, slot `status`, visually hidden) is rendered whether the overlay is
 * visible or not, so that screen readers know it before it speaks. While `visible`,
 * its text is `message` ("Loading…" by default), which is announced when `visible`
 * turns true: at once, as the controls a form makes read-only while it is busy change
 * at once too, not only when the wash fades in. When `visible` turns false the text is
 * emptied, which is not announced. The spinner's progressbar is named by the message;
 * the spinner is no status region of its own. With `children`, the wrapped content is
 * `aria-busy` while visible. Without `children`, mark the busy area yourself
 * (`aria-busy="true"`); Form does so on its `<form>` while it submits.
 *
 * The spinner is kept on the middle line of the visible area of the nearest scroll
 * container (or the viewport), as far as the wash reaches: on a wash taller than
 * what is shown of it, such as a long form scrolled to any point, the spinner stays
 * in the middle of what is shown. On a wash shown whole, it moves toward that line
 * as far as the wash allows, and stays inside the wash.
 *
 * The spinner sits on a disc of its own, the theme's `palette.background.paper` with a
 * 1px `palette.divider` edge, `theme.spacing(1)` wider than the spinner all around
 * (56px across at the Loader's default size and MUI's default spacing), so that the
 * spinner keeps its contrast whatever lies under it, also a primary-colored button,
 * tab or banner. The disc hides the content under it. A theme restyles it through
 * the `loader` slot (see {@link FormLoaderOverlayClassKey}).
 *
 * Stacking: the wash's z-index is one below `theme.zIndex.mobileStepper` (999 with
 * MUI's defaults), the lowest of the theme's app-level layers. It covers the content
 * of the area it is placed in, before or after the overlay in the DOM, also content
 * with a z-index of its own below that (outlined field labels, raised button bars).
 * App bars, drawers, dialogs, menus, snackbars and tooltips stay above it, so a dialog
 * opened while it is shown, such as one from a form's post-submit handler, can be
 * used. Content of the covered area with a z-index of 999 or more can show above
 * the wash, unless it is in a stacking context of its own (`isolation: isolate` on
 * its container), as the body of FormPageLayout is.
 *
 * Theme: `components.CcFormLoaderOverlay.styleOverrides` per slot, and `variants`
 * keyed on `visible` (see {@link FormLoaderOverlayClassKey}).
 *
 * @example
 * // the import form is inert while it is busy; the steps' buttons below stay usable
 * <FormLoaderOverlay visible={busy} message={t("import.busy")}>
 * 	<ImportForm />
 * </FormLoaderOverlay>
 * <StepButtons />
 */
export default React.memo(FormLoaderOverlay);
