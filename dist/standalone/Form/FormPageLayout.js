import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { styled, useThemeProps } from "@mui/material";
import React, { useCallback, useEffect, useRef } from "react";
import combineClassNames from "../../utils/combineClassNames";
const Root = styled("div", { name: "CcFormPageLayout", slot: "root" })({
    // fills the height of its parent, so that on a short form the body grows and the
    // footer goes down to the bottom of the page: in a flex column it takes the space
    // the other children leave; in a block of definite height (min-height: 100%) only
    // as the parent's only element, as other content there would overflow the parent
    flexGrow: 1,
    // never shorter than its content: a min-height replaces a flex item's automatic
    // minimum size, which otherwise keeps it from shrinking below its content
    flexShrink: 0,
    "&:only-child": {
        minHeight: "100%",
    },
    display: "flex",
    flexDirection: "column",
    // the containing block of `other`: the busy overlay covers the whole layout,
    // wherever it is placed and however far it is scrolled
    position: "relative",
});
const Wrapper = styled("div", { name: "CcFormPageLayout", slot: "wrapper" })({
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
});
const Body = styled("div", { name: "CcFormPageLayout", slot: "body" })({
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
    // in flow at the bottom of the layout, and held at most as low as 36px above the
    // bottom of the content area of whatever scrolls (a scrolling dialog content,
    // panel or main area, or the viewport): while the body is longer than that area,
    // the body scrolls under the footer; at the end of a long form, or on a short
    // form whose layout reaches that far down, it rests at that height
    position: "sticky",
    bottom: 36,
    flexShrink: 0,
    // as wide as its buttons
    alignSelf: "flex-start",
    // 30px between the body's content and the footer, plus the up to 36px the footer
    // is lifted by where the layout ends at the bottom of the visible area
    margin: "66px 0 0",
    transform: "translateX(36px)",
    padding: 0,
    // On a short screen (a phone held sideways, a page zoomed to 400%) a floating footer
    // would cover much of the little that is visible, so it stays in flow after the body,
    // where it rests at the end of a long form anyway: 30px below the body's content and
    // 36px above the end of the layout.
    "@media (max-height: 480px)": {
        position: "static",
        margin: "30px 0 36px",
    },
});
/**
 * Space left between a focused element and the footer when the element is scrolled out
 * from under the footer: the space between the body's content and a footer resting at
 * the end of the layout
 */
const FOCUS_CLEARANCE = 30;
/**
 * The nearest ancestor of the element that is a scroll container, the one a sticky
 * element sticks to, or `null` for the viewport
 * @param el The element
 */
const getScrollContainer = (el) => {
    const doc = el.ownerDocument;
    for (let node = el.parentElement; node && node !== doc.body && node !== doc.documentElement; node = node.parentElement) {
        const { overflowY } = getComputedStyle(node);
        if (overflowY !== "visible" && overflowY !== "clip")
            return node;
    }
    return null;
};
/**
 * Scrolls the focused element up if the floating footer covers it or it lies below the
 * footer, until it ends FOCUS_CLEARANCE above the footer, but never so far that its top
 * leaves the visible area. The browser scrolls a focused element into view only when it
 * lies outside the visible area, and the footer is inside it.
 * @param target The focused element, in the body
 * @param footer The footer
 */
const scrollClearOfFooter = (target, footer) => {
    const footerRect = footer.getBoundingClientRect();
    // no buttons
    if (footerRect.height === 0)
        return;
    const rect = target.getBoundingClientRect();
    // above the footer, or beside it: the footer is only as wide as its buttons
    if (rect.bottom <= footerRect.top ||
        rect.right <= footerRect.left ||
        rect.left >= footerRect.right)
        return;
    const scroller = getScrollContainer(footer);
    const visibleTop = scroller
        ? scroller.getBoundingClientRect().top + scroller.clientTop
        : 0;
    const distance = Math.min(rect.bottom - footerRect.top + FOCUS_CLEARANCE, rect.top - visibleTop);
    if (distance <= 0)
        return;
    (scroller ?? footer.ownerDocument.defaultView)?.scrollBy({ top: distance });
};
const FormPageLayout = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormPageLayout" });
    const { body, footer, other, className, classes } = props;
    const footerRef = useRef(null);
    const pendingFrame = useRef(null);
    useEffect(() => () => {
        if (pendingFrame.current !== null)
            cancelAnimationFrame(pendingFrame.current);
    }, []);
    // in the next frame, after the browser has scrolled the newly focused element into
    // view, which it does before or after this event depending on the browser
    const handleBodyFocus = useCallback((evt) => {
        const target = evt.target;
        // React also passes on focus inside portals that the body's content renders
        // (menus, popovers), which are not in the layout
        if (!evt.currentTarget.contains(target))
            return;
        if (pendingFrame.current !== null)
            cancelAnimationFrame(pendingFrame.current);
        pendingFrame.current = requestAnimationFrame(() => {
            pendingFrame.current = null;
            const footerElement = footerRef.current;
            if (!footerElement || target.ownerDocument.activeElement !== target)
                return;
            scrollClearOfFooter(target, footerElement);
        });
    }, []);
    return (_jsxs(Root, { className: combineClassNames([className, classes?.root]), children: [_jsxs(Wrapper, { className: classes?.wrapper, children: [_jsx(Body, { className: classes?.body, onFocus: handleBodyFocus, children: body }), _jsx(Footer, { ref: footerRef, className: classes?.footer, children: footer })] }), other] }));
};
/**
 * The page layout of every form page: BasicFormPage, and so DefaultFormPage,
 * EditOnlyFormPage and FlowEngineFormPage, renders the form as `body`, its buttons
 * as `footer` and its busy overlay (FormLoaderOverlay) as `other`.
 *
 * Layout: the root is `position: relative` and does not scroll itself; whatever
 * scrolls around it (a FormDialog's content, a scrolling panel, drawer or main area,
 * or the document) scrolls the form. The root fills the height of its parent: in a
 * flex column it grows into the space the other children leave (`flex-grow: 1`), and
 * as the only element of a parent of definite height it is at least as tall as that
 * parent (`min-height: 100%`). The body grows, and the footer follows it at the
 * bottom of the layout, 36px right of its start. The footer is `position: sticky`
 * with `bottom: 36px`, so it never sits lower than 36px above the bottom of the
 * visible area of whatever scrolls (the scroll container's content area, inside its
 * padding, or the viewport):
 *
 * - A long form: while the body reaches below the visible area, the footer stays 36px
 *   above the visible area's bottom and the body scrolls under it. Scrolled to the
 *   end, it rests there, at least 30px below the body's content, as long as the
 *   layout ends within 36px of the end of what scrolls.
 * - A short form: the layout fills its parent, so the footer sits at the bottom of the
 *   page, 36px above the bottom of the visible area, where the parent reaches down to
 *   within 36px of it (a page container that fills the main area, a FormDialog). In a
 *   layout that ends higher (in a parent only as tall as its content, next to other
 *   content in a block parent, or in a box that does not scroll and ends further up),
 *   the footer sits at the layout's bottom edge, 66px below the body's content.
 * - A short screen (at most 480px tall: a phone held sideways, a page zoomed to 400%):
 *   a floating footer would cover much of the little that is visible, so the footer
 *   is `position: static`, in flow after the body, 30px below the body's content and
 *   36px above the layout's end. That is where a floating footer rests at the end of a
 *   long form and on a short form that fills its parent; on a long form, Save is at
 *   the end.
 *
 * Keyboard focus: the browser scrolls a newly focused element into view only when it
 * lies outside the visible area, and the floating footer is inside it. So when an
 * element in the body gets the focus while the footer covers it or it lies below the
 * footer's top edge (within the footer's width), the layout scrolls it up in the next
 * frame, until it ends 30px above the footer, but no further than its top stays in
 * view. Focus inside a portal that the body's content renders (a menu, a popover) does
 * not scroll the form.
 *
 * An `overflow: hidden` ancestor between the layout and the element that scrolls
 * makes the footer stick to that ancestor, which does not scroll, so the footer then
 * stays below the content; use `overflow: clip` there.
 *
 * An absolutely positioned `other` covers the whole layout, however far it is
 * scrolled: the busy overlay covers the form, not the page or dialog around it.
 */
export default React.memo(FormPageLayout);
