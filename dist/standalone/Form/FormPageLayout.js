import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { styled, useThemeProps } from "@mui/material";
import React from "react";
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
});
const FormPageLayout = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormPageLayout" });
    const { body, footer, other, className, classes } = props;
    return (_jsxs(Root, { className: combineClassNames([className, classes?.root]), children: [_jsxs(Wrapper, { className: classes?.wrapper, children: [_jsx(Body, { className: classes?.body, children: body }), _jsx(Footer, { className: classes?.footer, children: footer })] }), other] }));
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
 *
 * An `overflow: hidden` ancestor between the layout and the element that scrolls
 * makes the footer stick to that ancestor, which does not scroll, so the footer then
 * stays below the content; use `overflow: clip` there.
 *
 * An absolutely positioned `other` covers the whole layout, however far it is
 * scrolled: the busy overlay covers the form, not the page or dialog around it.
 */
export default React.memo(FormPageLayout);
