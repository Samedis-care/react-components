import React, { useLayoutEffect, useRef } from "react";
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
		// keyboard focus that the overlay takes from the content it wraps; inside the
		// wash, so that a container that clips its overflow does not cut it off
		"&:focus-visible": {
			outline: `2px solid ${theme.palette.primary.main}`,
			outlineOffset: -2,
		},
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
export type FormLoaderOverlayClassKey =
	"root" | "loaderAnchor" | "loader" | "container" | "content";

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

const FormLoaderOverlay = (inProps: FormLoaderOverlayProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormLoaderOverlay" });
	const { visible, className, children } = props;
	const wraps = children !== undefined;

	const rootRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	// the element in the content that had keyboard focus when the overlay was shown
	const returnFocusRef = useRef<HTMLElement | null>(null);
	// The wrapped content is inert while the overlay is visible: set on the DOM, as
	// React 18 and 19 take the `inert` prop differently. Focus is moved out of the
	// content before it turns inert, as the browser would drop it to the page. Both
	// happen in the effect, not in a cleanup: React puts back the focus that changes
	// while it applies a commit to the DOM, which is when cleanups run
	useLayoutEffect(() => {
		const root = rootRef.current;
		const content = contentRef.current;
		if (!root || !content) return;
		const doc = content.ownerDocument;
		if (visible) {
			const active = doc.activeElement as HTMLElement | null;
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
		if (!returnFocus?.isConnected) return;
		const now = doc.activeElement;
		// focus moved out of the wash meanwhile stays where it is
		if (now && now !== root && now !== doc.body) return;
		returnFocus.focus();
	}, [visible, wraps]);

	const overlay = (
		<FormLoaderOverlayRoot
			ref={rootRef}
			tabIndex={wraps ? -1 : undefined}
			ownerState={{ visible }}
			className={className}
		>
			{visible && (
				<FormLoaderOverlayLoaderAnchor>
					<FormLoaderOverlayLoader />
				</FormLoaderOverlayLoaderAnchor>
			)}
		</FormLoaderOverlayRoot>
	);
	if (!wraps) return overlay;
	return (
		<FormLoaderOverlayContainer>
			<FormLoaderOverlayContent ref={contentRef}>
				{children}
			</FormLoaderOverlayContent>
			{overlay}
		</FormLoaderOverlayContainer>
	);
};

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
export default React.memo(FormLoaderOverlay);
