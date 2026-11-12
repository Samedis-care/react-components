import React from "react";
import Loader from "../Loader";
import { styled, useThemeProps } from "@mui/material";

export interface FormLoaderOverlayRootOwnerState {
	visible: boolean;
}

const FormLoaderOverlayRoot = styled("div", {
	name: "CcFormLoaderOverlay",
	slot: "root",
})<{ ownerState: FormLoaderOverlayRootOwnerState }>(
	({ theme, ownerState: { visible } }) => ({
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
		backgroundColor: "rgba(255,255,255,.3)",
		transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 1000ms",
		...(visible
			? { visibility: "visible", opacity: 1 }
			: { visibility: "hidden", opacity: 0 }),
	}),
);

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
})({});

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

const FormLoaderOverlay = (inProps: FormLoaderOverlayProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormLoaderOverlay" });

	return (
		<FormLoaderOverlayRoot
			ownerState={{ visible: props.visible }}
			className={props.className}
		>
			{props.visible && (
				<FormLoaderOverlayLoaderAnchor>
					<FormLoaderOverlayLoader />
				</FormLoaderOverlayLoaderAnchor>
			)}
		</FormLoaderOverlayRoot>
	);
};

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
 */
export default React.memo(FormLoaderOverlay);
