import React, { useId, useLayoutEffect, useRef } from "react";
import { circularProgressClasses, styled, useThemeProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import Loader from "../Loader";
import ccI18n from "../../i18n";

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
})(({ theme }) => ({
	// the spinner sits on a disc of its own, paper with the edge of an outlined Paper, so
	// that it keeps its contrast over whatever lies under the wash, also a primary-colored
	// button, tab or banner. The disc reaches theme.spacing(1) beyond the spinner, into
	// the space the Loader keeps above and below it, and leaves the Loader's size as it
	// is. It is the spinner's own box, which turns: disc and edge are even all around, so
	// that the turning does not show, and the edge is a shadow, which takes no room
	[`& .${circularProgressClasses.root}`]: {
		boxSizing: "content-box",
		padding: theme.spacing(1),
		margin: theme.spacing(-1),
		borderRadius: "50%",
		backgroundColor: theme.palette.background.paper,
		boxShadow: `0 0 0 1px ${theme.palette.divider}`,
	},
}));

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

// the status message: outside the wash, which is `visibility: hidden` while the overlay
// is idle and would take it out of the accessibility tree, so that it stays the same
// element in the tree and only its text changes (a live region that appears together
// with its text is not announced by every screen reader)
const FormLoaderOverlayStatus = styled("div", {
	name: "CcFormLoaderOverlay",
	slot: "status",
})({
	// visually hidden, as MUI's visuallyHidden, but inside the area the wash covers: in
	// its top left corner, without visuallyHidden's -1px margin. Where it would follow
	// the content, that margin put it 1px past the area's start edge, which in a
	// right-to-left layout on a left-to-right page (the right edge) scrolled the page
	// sideways
	border: 0,
	clipPath: "inset(50%)",
	height: 1,
	overflow: "hidden",
	padding: 0,
	position: "absolute",
	top: 0,
	left: 0,
	whiteSpace: "nowrap",
	width: 1,
});

/**
 * The default status message while the library's translations are still loading
 */
const DEFAULT_MESSAGE = "Loading…";

/**
 * The overlay does not suspend, like the Loader it shows: until the translations have
 * loaded it uses {@link DEFAULT_MESSAGE}, then re-renders
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };

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
export type FormLoaderOverlayClassKey =
	"root" | "loaderAnchor" | "loader" | "container" | "content" | "status";

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

const FormLoaderOverlay = (inProps: FormLoaderOverlayProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormLoaderOverlay" });
	const { visible, className, message, children } = props;
	const wraps = children !== undefined;
	const { t, ready } = useTranslation("translation", TRANSLATION_OPTIONS);
	const statusMessage =
		message || (ready ? t("standalone.loader.label") : DEFAULT_MESSAGE);
	const statusId = useId();

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

	// the status region below is the overlay's one status: the Loader in the wash is no
	// status region of its own, and the message names its spinner
	const overlay = (
		<FormLoaderOverlayRoot
			ref={rootRef}
			tabIndex={wraps ? -1 : undefined}
			ownerState={{ visible }}
			className={className}
		>
			{visible && (
				<FormLoaderOverlayLoaderAnchor>
					<FormLoaderOverlayLoader role={"none"} aria-labelledby={statusId} />
				</FormLoaderOverlayLoaderAnchor>
			)}
		</FormLoaderOverlayRoot>
	);
	const status = (
		// not busy itself, so that a screen reader that holds back the messages of a busy
		// area (an aria-busy form around the overlay) still announces this one
		<FormLoaderOverlayStatus id={statusId} role={"status"} aria-busy={false}>
			{visible ? statusMessage : ""}
		</FormLoaderOverlayStatus>
	);
	if (!wraps)
		return (
			<>
				{overlay}
				{status}
			</>
		);
	return (
		<FormLoaderOverlayContainer>
			<FormLoaderOverlayContent
				ref={contentRef}
				aria-busy={visible || undefined}
			>
				{children}
			</FormLoaderOverlayContent>
			{overlay}
			{status}
		</FormLoaderOverlayContainer>
	);
};

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
export default React.memo(FormLoaderOverlay);
