import React from "react";
export interface FormLoaderOverlayRootOwnerState {
    visible: boolean;
}
/**
 * Theme style slots of {@link FormLoaderOverlay}
 * (`components.CcFormLoaderOverlay.styleOverrides.<slot>`):
 * - `root`: the wash over the nearest positioned ancestor
 * - `loaderAnchor`: a line of zero height inside the wash, `position: sticky` in the
 *   middle of the visible area, that the spinner is centered on
 * - `loader`: the spinner (a Loader)
 */
export type FormLoaderOverlayClassKey = "root" | "loaderAnchor" | "loader";
export interface FormLoaderOverlayProps {
    /**
     * should the overlay be shown? will trigger fade-in, set to isSubmitting
     */
    visible: boolean;
    /**
     * custom styles applied to root
     */
    className?: string;
}
/**
 * Busy overlay: a translucent wash with a spinner over the nearest positioned
 * ancestor (`position: absolute`, `inset: 0`). It blocks pointer input only.
 * BasicFormPage shows it over the form page while the form is submitting, through
 * FormPageLayout's `other`, which makes it cover the form layout.
 *
 * The spinner is kept on the middle line of the visible area of the nearest scroll
 * container (or the viewport), as far as the wash reaches: on a wash taller than
 * what is shown of it, such as a long form scrolled to any point, the spinner stays
 * in the middle of what is shown. On a wash shown whole, it moves toward that line
 * as far as the wash allows, and stays inside the wash.
 */
declare const _default: React.MemoExoticComponent<(inProps: FormLoaderOverlayProps) => React.JSX.Element>;
export default _default;
