import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import Loader from "../Loader";
import { styled, useThemeProps } from "@mui/material";
const FormLoaderOverlayRoot = styled("div", {
    name: "CcFormLoaderOverlay",
    slot: "root",
})(({ theme, ownerState: { visible } }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
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
}));
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
const FormLoaderOverlay = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormLoaderOverlay" });
    return (_jsx(FormLoaderOverlayRoot, { ownerState: { visible: props.visible }, className: props.className, children: props.visible && (_jsx(FormLoaderOverlayLoaderAnchor, { children: _jsx(FormLoaderOverlayLoader, {}) })) }));
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
 */
export default React.memo(FormLoaderOverlay);
