import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { CircularProgress, styled, Typography, useThemeProps, } from "@mui/material";
import { useTranslation } from "react-i18next";
import combineClassNames from "../../utils/combineClassNames";
import ccI18n from "../../i18n";
/**
 * What MUI keeps off the DOM of a root slot, plus the Loader's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set([
    "text",
    "typographyVariant",
    "ownerState",
    "theme",
    "sx",
    "as",
    "classes",
]);
const Root = styled("div", {
    name: "CcLoader",
    slot: "root",
    shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
})({
    // in flow, so that a parent of automatic height makes room for the content;
    // a parent with a definite height is filled, its content centered
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
    width: "100%",
});
// text and spinner as one block; the padding is equal above and below, so
// centering the block centers text and spinner
const InnerWrapper = styled("div", { name: "CcLoader", slot: "innerWrapper" })(({ theme }) => ({
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    // a word wider than the Loader (a German compound on a phone) breaks
    // inside, and does not widen the Loader or the page
    overflowWrap: "anywhere",
    padding: theme.spacing(2, 0),
    textAlign: "center",
    width: "100%",
}));
const Progress = styled(CircularProgress, {
    name: "CcLoader",
    slot: "progress",
})({});
/**
 * Name of the progressbar without text while the library's translations are
 * still loading
 */
const DEFAULT_NAME = "Loading…";
/**
 * The Loader is a Suspense fallback, also the app's while it boots, so its
 * translation must not suspend: until the translations have loaded it uses
 * {@link DEFAULT_NAME}, then re-renders
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };
const Loader = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcLoader" });
    const { text, typographyVariant: typographyVariantProp, className, classes, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...rootProps } = props;
    const typographyVariant = typographyVariantProp ?? "h6";
    const { t, ready } = useTranslation("translation", TRANSLATION_OPTIONS);
    const textId = React.useId();
    // a name the caller gives wins; otherwise the text names the progressbar,
    // and without text the default name does
    let progressLabel = ariaLabel;
    let progressLabelledBy = ariaLabelledBy;
    if (!ariaLabel && !ariaLabelledBy) {
        progressLabel = undefined;
        progressLabelledBy = undefined;
        if (text)
            progressLabelledBy = textId;
        else
            progressLabel = ready ? t("standalone.loader.label") : DEFAULT_NAME;
    }
    return (_jsx(Root, { role: "status", ...rootProps, text: text, typographyVariant: typographyVariant, className: combineClassNames([className, classes?.root]), children: _jsxs(InnerWrapper, { className: classes?.innerWrapper, children: [text && (_jsx(Typography, { id: textId, variant: typographyVariant, children: text })), _jsx(Progress, { className: classes?.progress, "aria-label": progressLabel, "aria-labelledby": progressLabelledBy })] }) }));
};
/**
 * Indeterminate loading indicator: a MUI `CircularProgress` with an optional
 * status `text` above it, centered in its parent.
 *
 * Layout: text and spinner form one block. In a parent with a definite height
 * (a fixed height, or a box that a flex or grid layout stretches) the Loader
 * fills the parent and centers that block in it; a block taller than the
 * parent overflows it equally above and below. In a parent of automatic
 * height the Loader is as tall as the block: 72px without text (the 40px
 * spinner and 16px above and below it), and with text the text's height and
 * 8px more (at MUI's default spacing).
 *
 * Styling: `className`, `sx`, `style` and the other HTML attributes go to
 * the `root` slot, `classes` to the slot of each key, so `styled(Loader)`
 * styles the outer box.
 *
 * Accessibility: the `root` slot is a polite status region
 * (`role="status"`) around text and spinner, so screen readers announce the
 * loading; `aria-live="off"` silences it where many Loaders show at once.
 * Nothing in it is focusable. The spinner is a `progressbar`, named by
 * `text`, or without text "Loading…" in the library's current language.
 * `aria-label` and `aria-labelledby` replace that name. A status region
 * that mounts together with its content is not announced by every screen
 * reader: a message that must be heard belongs in a status region the app
 * keeps mounted. The Loader sets no `aria-busy`; that belongs on the region
 * whose content is loading. The Loader does not suspend, also not before
 * the library's translations have loaded, so it can be a Suspense fallback.
 *
 * Theme: `components.CcLoader.defaultProps` ({@link LoaderProps}),
 * `components.CcLoader.styleOverrides` per {@link LoaderClassKey} slot, and
 * `components.CcLoader.variants`, which apply to the `root` slot.
 */
export default React.memo(Loader);
