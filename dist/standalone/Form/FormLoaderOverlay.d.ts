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
 * - `loader`: the spinner (a Loader). It is no status region of its own
 *   (`role="none"`): the `status` slot is, and its message names the spinner. Its
 *   styles give the spinner (`& .MuiCircularProgress-root`) its disc: the theme's
 *   `palette.background.paper` with a 1px `palette.divider` edge (a `box-shadow`),
 *   `theme.spacing(1)` wider than the spinner all around. A theme restyles or removes
 *   the disc with the same selector, such as
 *   `loader: { "& .MuiCircularProgress-root": { backgroundColor: "transparent", boxShadow: "none" } }`
 * - `container`: with `children` only, the `position: relative` block around the
 *   content and the wash
 * - `content`: with `children` only, the block around the children that is `inert`
 *   and `aria-busy` while the overlay is visible
 * - `status`: the status region (`role="status"`) with the `message` while the
 *   overlay is visible, visually hidden: a 1px box in the top left corner of the area
 *   the wash covers, inside it, so that it makes no page scroll in either direction.
 *   It is rendered also while the overlay is not visible, outside the wash: right
 *   after it, inside the container with `children`
 */
export type FormLoaderOverlayClassKey = "root" | "loaderAnchor" | "loader" | "container" | "content" | "status";
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
     * The status message that screen readers announce while the overlay is visible,
     * already translated, such as "The form is currently being saved" (BasicFormPage)
     * or "Importing devices…". It is not shown on screen: it is the text of the
     * overlay's status region (slot `status`), and it names the spinner's
     * progressbar. It is announced when `visible` turns true (at once, not only when
     * the wash fades in), and again when it changes while the overlay is visible.
     * Without it (`undefined` or `""`), the message is "Loading…" in the library's
     * current language.
     * @default "Loading…", translated
     */
    message?: string;
    /**
     * The content the overlay covers. With `children`, the overlay wraps them: it
     * renders a `position: relative` container (slot `container`) that holds the
     * children in a block of their own (slot `content`) and the wash over them, so
     * the wash covers the children and nothing else.
     *
     * While `visible`, the content is `inert` and `aria-busy`: pointer and keyboard
     * reach none of its controls, and assistive technology skips it. If keyboard focus
     * is in the content when `visible` turns true, it moves to the wash; when `visible`
     * turns false, it goes back to the element that had it, unless it was moved out of
     * the wash meanwhile or that element is gone.
     *
     * Without `children` (`undefined`), the overlay is the wash alone, over the nearest
     * positioned ancestor, and makes nothing inert (see {@link FormLoaderOverlay}).
     * @default undefined (the wash alone)
     */
    children?: React.ReactNode;
}
/**
 * Busy overlay: a translucent wash with a spinner on a disc over the nearest positioned
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
 * @example
 * // the import form is inert while it is busy; the steps' buttons below stay usable
 * <FormLoaderOverlay visible={busy} message={t("import.busy")}>
 * 	<ImportForm />
 * </FormLoaderOverlay>
 * <StepButtons />
 */
declare const _default: React.MemoExoticComponent<(inProps: FormLoaderOverlayProps) => React.JSX.Element>;
export default _default;
