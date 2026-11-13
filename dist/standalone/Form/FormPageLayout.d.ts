import React from "react";
export interface FormPageLayoutProps {
    /**
     * Page content, usually the form. A flex column that grows to fill the layout's
     * height above the footer.
     */
    body: React.ReactNode;
    /**
     * Button bar, usually `<FormButtons>`. Follows the body and, while the body is
     * longer than the visible area, floats over its bottom, except on a screen at most
     * 480px tall (see {@link FormPageLayout}); give it an opaque background, as
     * FormButtons has, so that the content scrolling under it is hidden. `null` for no
     * buttons.
     */
    footer: React.ReactNode;
    /**
     * Rendered inside the root after body and footer. The root is positioned, so an
     * absolutely positioned `other`, like the busy overlay (`FormLoaderOverlay`) that
     * BasicFormPage passes here, covers the whole layout and nothing outside it.
     * @default undefined (nothing)
     */
    other?: React.ReactNode;
    /**
     * class name to apply to root
     */
    className?: string;
    /**
     * custom CSS classes
     */
    classes?: Partial<Record<FormPageLayoutClassKey, string>>;
}
export type FormPageLayoutClassKey = "root" | "wrapper" | "body" | "footer";
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
declare const _default: React.MemoExoticComponent<(inProps: FormPageLayoutProps) => React.JSX.Element>;
export default _default;
