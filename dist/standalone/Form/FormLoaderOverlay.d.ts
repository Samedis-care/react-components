import React from "react";
export interface FormLoaderOverlayRootOwnerState {
    visible: boolean;
}
/**
 * Theme style slots of {@link FormLoaderOverlay}
 * (`components.CcFormLoaderOverlay.styleOverrides.<slot>`):
 * - `root`: the wash over the nearest positioned ancestor (with `children`, over the
 *   container)
 * - `loaderAnchor`: a line of zero height inside the wash, `position: sticky` in the
 *   middle of the visible area, that the spinner is centered on
 * - `loader`: the spinner (a Loader)
 * - `container`: with `children` only, the `position: relative` block around the
 *   content and the wash
 * - `content`: with `children` only, the block around the children that is `inert`
 *   while the overlay is visible
 */
export type FormLoaderOverlayClassKey = "root" | "loaderAnchor" | "loader" | "container" | "content";
export interface FormLoaderOverlayProps {
    /**
     * should the overlay be shown? will trigger fade-in, set to isSubmitting
     */
    visible: boolean;
    /**
     * custom styles applied to root
     */
    className?: string;
    /**
     * The content the overlay covers. With `children`, the overlay wraps them: it
     * renders a `position: relative` container (slot `container`) that holds the
     * children in a block of their own (slot `content`) and the wash over them, so
     * the wash covers the children and nothing else.
     *
     * While `visible`, the content is `inert`: pointer and keyboard reach none of its
     * controls, and assistive technology skips it. If keyboard focus is in the content
     * when `visible` turns true, it moves to the wash; when `visible` turns false, it
     * goes back to the element that had it, unless it was moved out of the wash
     * meanwhile or that element is gone.
     *
     * Without `children` (`undefined`), the overlay is the wash alone, over the nearest
     * positioned ancestor, and makes nothing inert (see {@link FormLoaderOverlay}).
     * @default undefined (the wash alone)
     */
    children?: React.ReactNode;
}
/**
 * Busy overlay: a translucent wash with a spinner over the nearest positioned
 * ancestor (`position: absolute`, `inset: 0`), or, with `children`, over them.
 * BasicFormPage shows it over the form page while the form is submitting, through
 * FormPageLayout's `other`, which makes it cover the form layout.
 *
 * Input: the wash alone blocks pointer input only. The controls under it stay
 * reachable with Tab and operable by keyboard: disable them while it is shown, or pass
 * them as `children`, which makes them `inert` while it is shown, so that neither
 * pointer nor keyboard reaches them; keyboard focus in them moves to the wash and back
 * (see {@link FormLoaderOverlayProps.children}). In a form page, Form makes its fields
 * and buttons read-only while it is busy (Save stays focusable as an `aria-disabled`
 * button); controls of the page that do not follow the form's read-only state stay
 * operable by keyboard under the wash. With no positioned ancestor, the wash covers the
 * initial viewport, and the page under it stays operable by keyboard.
 *
 * The spinner is kept on the middle line of the visible area of the nearest scroll
 * container (or the viewport), as far as the wash reaches: on a wash taller than
 * what is shown of it, such as a long form scrolled to any point, the spinner stays
 * in the middle of what is shown. On a wash shown whole, it moves toward that line
 * as far as the wash allows, and stays inside the wash.
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
 * @example
 * // the import form is inert while it is busy; the steps' buttons below stay usable
 * <FormLoaderOverlay visible={busy}>
 * 	<ImportForm />
 * </FormLoaderOverlay>
 * <StepButtons />
 */
declare const _default: React.MemoExoticComponent<(inProps: FormLoaderOverlayProps) => React.JSX.Element>;
export default _default;
