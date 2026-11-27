import React from "react";
/**
 * Theme style slots of {@link FormLoaderOverlay}
 * (`components.CcFormLoaderOverlay.styleOverrides.<slot>`), also the keys of its
 * `classes` prop:
 * - `root`: the wash over the nearest positioned ancestor (with `children`, over the
 *   container), the theme's `palette.background.paper` at 30% opacity. While the
 *   overlay is visible it has the class `CcFormLoaderOverlay-visible`. With
 *   `children`, it takes the keyboard focus from them and shows a focus ring
 *   (`:focus-visible`: a 2px `palette.primary.main` outline inside its edge) at once,
 *   also before the wash fades in
 * - `loaderAnchor`: a line of zero height inside the wash, `position: sticky` in the
 *   middle of the visible area, that the spinner is centered on. It is rendered also
 *   while the overlay is hidden, empty and transparent; the spinner fades in with its
 *   `opacity`, which takes the root's `transition`
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
 *
 * No slot receives an `ownerState`: a function override is called with the theme. A
 * theme styles the visible overlay with theme `variants` keyed on `visible`
 * (`{ props: { visible: true }, style: { … } }`), which apply to the root, or with
 * the state class in the root's override (`root: { "&.CcFormLoaderOverlay-visible":
 * { … } }`). The root's own styles of the hidden and the visible state (visibility,
 * the fade-in) give way to both, and to any other override of the root, except where
 * the fade-in starts: the wash's color is transparent while the overlay is hidden and
 * at the start of every show, whatever color the theme gives it.
 *
 * What fades in is the wash's color (the root's `background-color`) and the spinner
 * (the `loaderAnchor` slot's `opacity`), not the root as a whole, so that its focus
 * ring shows at once: anything else a theme draws on the root (a border, a shadow, a
 * background image) shows as soon as the overlay is shown.
 */
export type FormLoaderOverlayClassKey = "root" | "loaderAnchor" | "loader" | "container" | "content" | "status";
/**
 * Props of {@link FormLoaderOverlay} (theme `defaultProps` take a `Partial` of them).
 * Other attributes, such as `aria-*` and `data-*`, type-check, as hyphenated JSX
 * attributes always do, but are not passed on: the overlay's status message is
 * `message`.
 */
export interface FormLoaderOverlayProps {
    /**
     * Whether the overlay is shown, such as a form's `isSubmitting`. Required.
     *
     * Every show fades in late: when the overlay is shown, as `visible` turns true or
     * as the overlay is mounted with `visible` already true, the wash blocks the
     * pointer at once, stays transparent for 1s and then fades in, so that a busy
     * phase shorter than 1s never paints it. A show right after a hide starts from
     * transparent too. `false` hides the wash at once and removes the spinner. What
     * fades in is the wash's color and its spinner: the focus ring of a wash that takes
     * the keyboard focus from its `children` shows at once.
     *
     * The fade-in takes its timing from the theme, like MUI's Fade: it is
     * `theme.transitions.create(["background-color", "opacity"])` over
     * `transitions.duration.enteringScreen` (225ms with MUI's defaults) with
     * `transitions.easing.easeInOut`, delayed by the 1s. A theme whose
     * `transitions.create` returns `"none"` shows the wash at once.
     * The status message (see `message`) and, with `children`, the `inert` and
     * `aria-busy` content follow `visible` at once, not the fade.
     */
    visible: boolean;
    /**
     * Class name added to the root, the wash (with `classes.root`)
     */
    className?: string;
    /**
     * Class names added to the slots, by slot (see {@link FormLoaderOverlayClassKey}).
     * `loader` is rendered while the overlay is visible only, `container` and
     * `content` with `children` only.
     * @default undefined (none)
     */
    classes?: Partial<Record<FormLoaderOverlayClassKey, string>>;
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
     * is in the content when `visible` turns true, it moves to the wash, whose focus
     * ring shows at once, also before the wash fades in; when `visible` turns false, it
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
declare const _default: React.MemoExoticComponent<(inProps: FormLoaderOverlayProps) => React.JSX.Element>;
export default _default;
