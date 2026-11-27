import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useContext, useMemo } from "react";
import { Skeleton, skeletonClasses, styled, } from "@mui/material";
import { Toast } from "../standalone/Toast";
import ToastErrorBoundary from "./ToastErrorBoundary";
/**
 * Set by a ToastContextProvider: around its children with disableDefaultOutlet,
 * else around its own ToastOutlet only (and null around its children)
 */
export const ToastOutletContext = React.createContext(null);
/**
 * Skeleton text lines that stand in for a toast's title or message while it
 * loads, as wide as such a text usually is and never wider than the toast
 * @param theme The theme
 * @param width The width of the lines, a CSS length; a second line is 60% of it
 * @returns The styles of the lines' wrapper
 */
const loadingTextStyles = (theme, width) => ({
    // a grid track that may shrink to nothing: a block of that width would keep
    // the toast from getting narrower than it, and push it off a phone's screen
    display: "grid",
    gridTemplateColumns: `minmax(0, ${width})`,
    [`& > .${skeletonClasses.root}`]: {
        // MUI's tint (11% of the text color, 13% in a dark palette), but of the
        // toast's text color: the page's barely shows on a filled toast
        backgroundColor: "color-mix(in srgb, currentColor 11%, transparent)",
        ...theme.applyStyles("dark", {
            backgroundColor: "color-mix(in srgb, currentColor 13%, transparent)",
        }),
    },
    [`& > .${skeletonClasses.root}:nth-of-type(2)`]: {
        width: "60%",
    },
});
const LoadingTitle = styled("span")(({ theme }) => loadingTextStyles(theme, "8em"));
const LoadingMessage = styled("span")(({ theme }) => loadingTextStyles(theme, "20em"));
// shown while a toast's title or message loads: a line for a short title, a
// line and a half for a message. Hidden from assistive technology: the toast's
// live region, in the page all along, announces the text once it is in
const titleFallback = (_jsx(LoadingTitle, { "aria-hidden": true, children: _jsx(Skeleton, { variant: "text" }) }));
const messageFallback = (_jsxs(LoadingMessage, { "aria-hidden": true, children: [_jsx(Skeleton, { variant: "text" }), _jsx(Skeleton, { variant: "text" })] }));
/**
 * Renders the toasts of the ToastContextProvider around it, one at a time, when
 * that provider has disableDefaultOutlet. A toast's title and message render
 * here, so they can use every context provided around the outlet (the
 * Framework puts its outlet inside its DialogContextProvider). Render one
 * outlet per provider; inside a provider without disableDefaultOutlet it
 * renders nothing, that provider renders its toasts itself.
 *
 * An error thrown while rendering a toast (e.g. by a component in its message)
 * does not reach the app: the toast is dropped, the next one shows as usual,
 * and the error is reported (see configureErrorReporting, source
 * "ToastOutlet").
 *
 * A title or message that suspends (e.g. a React.lazy component in it) does not
 * reach the app's Suspense either: the toast shows right away, with skeleton
 * text lines in place of that title or message until it has loaded. Screen
 * readers announce the toast's text once it is in. A toast still loading
 * closes and gives way to the next one like any other.
 */
const ToastOutlet = () => {
    const outlet = useContext(ToastOutletContext);
    const toast = outlet?.state.current;
    const title = toast?.title;
    const message = toast?.message;
    // around the content only, not the whole Toast: a Toast suspended before it
    // opened does not call onExited when it is closed meanwhile, and every
    // later toast waits for that. A falsy title is passed on as it is
    const suspensefulTitle = useMemo(() => title ? _jsx(Suspense, { fallback: titleFallback, children: title }) : title, [title]);
    const suspensefulMessage = useMemo(() => _jsx(Suspense, { fallback: messageFallback, children: message }), [message]);
    if (!outlet || !toast)
        return null;
    return (_jsx(ToastErrorBoundary, { onError: outlet.exited, resetKey: outlet.state, children: _jsx(Toast, { open: outlet.state.open, severity: toast.severity, title: suspensefulTitle, message: suspensefulMessage, autoHideDuration: toast.autoHideDuration, anchorOrigin: toast.anchorOrigin, phoneVertical: toast.phoneVertical, onClose: outlet.close, onExited: outlet.exited }) }));
};
export default React.memo(ToastOutlet);
