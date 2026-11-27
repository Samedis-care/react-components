import React from "react";
/**
 * Props of {@link FormPageLayout}, and of every replacement layout set through
 * `components.CcBasicFormPage.defaultProps.formPageLayoutComponent`.
 *
 * BasicFormPage (and so DefaultFormPage, EditOnlyFormPage and FlowEngineFormPage)
 * passes only `body`, `footer` and `other`, never `className` or `classes`. While a
 * nested form page is open inside `body`, it passes `footer={null}` and
 * `other={undefined}`, so that only the innermost page shows its buttons and busy
 * overlay.
 */
export interface FormPageLayoutProps {
    /**
     * Page content, usually the form. A flex column that grows to fill the layout's
     * height above the footer: every child, including a bare text run, becomes its own
     * row and is stretched to the full width (wrap inline content and buttons in a Box
     * or Grid), and a child with `flexGrow: 1` fills the remaining height.
     */
    body: React.ReactNode;
    /**
     * Button bar, usually `<FormButtons>`. Follows the body and, while the body is
     * longer than the visible area, floats over its bottom, except on a screen at most
     * 480px tall (see {@link FormPageLayout}); give it an opaque background, as
     * FormButtons has, so that the content scrolling under it is hidden.
     *
     * It is as wide as its content, but never wider than the layout, and starts at the
     * layout's start edge: its left edge, or its right edge in a right-to-left layout.
     * Its content has to wrap or shrink to fit there, as FormButtons' buttons do; a
     * footer that can do neither still sticks out on a narrow screen.
     *
     * `null`, `undefined` or `false` for no buttons, as BasicFormPage passes while a
     * nested form page is open in its body: the layout then renders no footer element
     * and keeps no space for one. A footer that renders nothing, such as a FormButtons
     * without a button, is hidden and takes no space either.
     * @default undefined (no footer)
     */
    footer?: React.ReactNode;
    /**
     * Rendered inside the root after body and footer. The root is positioned, so an
     * absolutely positioned `other`, like the busy overlay (`FormLoaderOverlay`) that
     * BasicFormPage passes here, covers the whole layout and nothing outside it. A
     * replacement layout (`formPageLayoutComponent`) has to render it, or form pages
     * show no busy overlay. In-flow content ends up after the body and the footer, at
     * the end of the layout.
     * @default undefined (nothing)
     */
    other?: React.ReactNode;
    /**
     * Class name added to the root (with `classes.root`). BasicFormPage does not set
     * it: style form pages through the theme
     * (`components.CcFormPageLayout.styleOverrides`).
     */
    className?: string;
    /**
     * Class names added to the slots, by slot (see {@link FormPageLayoutClassKey});
     * `footer` only while there is a footer. BasicFormPage does not set them. Theme
     * `defaultProps.classes` are replaced, not merged, by this prop.
     * @default undefined (none)
     */
    classes?: Partial<Record<FormPageLayoutClassKey, string>>;
}
/**
 * Theme style slots of {@link FormPageLayout}
 * (`components.CcFormPageLayout.styleOverrides.<slot>`), also the keys of its
 * `classes` prop:
 * - `root`: the outer flex column, `position: relative`, the containing block of
 *   `other`. It fills the height of its parent and has no padding of its own
 * - `wrapper`: the flex column holding body and footer
 * - `body`: the content area, a flex column that grows, and a stacking context of its
 *   own (`isolation: isolate`), so that the footer paints above all of its content
 * - `footer`: the button bar, `position: sticky` with `bottom: theme.spacing(4.5)`.
 *   Rendered only with a `footer`, and hidden while it renders nothing (`:empty`)
 *
 * These overrides style FormPageLayout only: a theme that replaces the layout of form
 * pages through `components.CcBasicFormPage.defaultProps.formPageLayoutComponent`
 * leaves them without effect there.
 */
export type FormPageLayoutClassKey = "root" | "wrapper" | "body" | "footer";
/**
 * The page layout of every form page: BasicFormPage, and so DefaultFormPage,
 * EditOnlyFormPage and FlowEngineFormPage, renders the form as `body`, its buttons
 * as `footer` and its busy overlay (FormLoaderOverlay) as `other`. It can also be
 * used on its own, such as for a page with a floating action bar that is no form.
 *
 * Layout: the root is `position: relative` and does not scroll itself; whatever
 * scrolls around it (a FormDialog's content, a scrolling panel, drawer or main area,
 * or the document) scrolls the form. The root fills the height of its parent: in a
 * flex column it grows into the space the other children leave (`flex-grow: 1`), and
 * as the only element of a parent of definite height it is at least as tall as that
 * parent (`min-height: 100%`). The body grows, and the footer follows it at the
 * bottom of the layout. The footer is `position: sticky` with `bottom: 36px`, so it
 * never sits lower than 36px above the bottom of the visible area of whatever scrolls
 * (the scroll container's content area, inside its padding, or the viewport):
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
 * The distances are the theme's spacing, given here at MUI's default of 8px: 36px is
 * `theme.spacing(4.5)`, 30px is `theme.spacing(3.75)` and 66px their sum. A theme with
 * another spacing scales them all, also the space kept above the footer when the focus
 * is scrolled clear of it (see below).
 *
 * Horizontally, the footer is as wide as its content, but never wider than the layout
 * (`align-self: flex-start` with `max-width: 100%`), and sits at the layout's start
 * edge: the left edge, or the right edge in a right-to-left layout. A footer whose
 * content can wrap or shrink to fit there, as FormButtons' buttons do, therefore stays
 * within the layout on a narrow screen; one that can do neither still sticks out.
 *
 * Without buttons (`footer` `null`, `undefined` or `false`, as BasicFormPage passes
 * while a nested form page is open in its body) the layout renders no footer element
 * and keeps no space for one: it ends where the body ends, so a nested form page ends
 * like any other. A footer that renders nothing, such as a FormButtons without a
 * button left, is hidden while it is empty (`:empty`) and takes no space either.
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
 *
 * The layout adds no role, landmark or tab stop: keyboard focus goes through the
 * body, then the footer, then `other`.
 *
 * Theme: `components.CcFormPageLayout.styleOverrides` per
 * {@link FormPageLayoutClassKey} slot. To replace the layout of every form page, set
 * `components.CcBasicFormPage.defaultProps.formPageLayoutComponent` to a component
 * that takes {@link FormPageLayoutProps}.
 *
 * @example
 * <FormDialog dialogTitle={t("import.title")}>
 * 	<FormPageLayout
 * 		body={<ImportSteps />}
 * 		footer={
 * 			<FormButtons>
 * 				<ActionButton onClick={next}>{t("import.next")}</ActionButton>
 * 			</FormButtons>
 * 		}
 * 		other={<FormLoaderOverlay visible={busy} message={t("import.busy")} />}
 * 	/>
 * </FormDialog>
 */
declare const _default: React.MemoExoticComponent<(inProps: FormPageLayoutProps) => React.JSX.Element>;
export default _default;
