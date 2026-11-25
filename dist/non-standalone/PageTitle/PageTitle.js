import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { styled, Typography, useThemeProps, } from "@mui/material";
import { useForkRef } from "@mui/material/utils";
import useSetFormDialogTitle from "../../backend-components/Form/useSetFormDialogTitle";
import usePageTitle from "../../standalone/Routes/usePageTitle";
import usePageHeading from "../../standalone/Routes/usePageHeading";
const PageTitleRoot = styled(Typography, {
    name: "CcPageTitle",
    slot: "root",
})({});
/**
 * The text of an element, kept up to date while its content changes
 * @param element The element, null for none
 * @returns The text with its white space collapsed, null for none or empty
 */
const useTextContent = (element) => {
    const [text, setText] = useState(null);
    useEffect(() => {
        if (!element)
            return;
        const update = () => setText((element.textContent ?? "").replace(/\s+/g, " ").trim() || null);
        update();
        const observer = new MutationObserver(update);
        observer.observe(element, {
            subtree: true,
            childList: true,
            characterData: true,
        });
        return () => observer.disconnect();
    }, [element]);
    return element ? text : null;
};
/**
 * The visible title of a page: a heading (`<h1>` by default) that also names
 * the document (browser tab, history, what a screen reader announces for the
 * window) after its text, through `usePageTitle`. HistoryRouter builds the
 * document title from it, by default "<text> – <app title>", e.g.
 * "Device 4711 – Samedis.care".
 *
 * Inside a FullFormDialog it renders nothing and its content becomes the
 * dialog's title instead (see `useSetFormDialogTitle`), so a page opened in a
 * dialog does not repeat its title below the title bar; the document title
 * stays the one of the page below the dialog.
 *
 * After a navigation that leaves the keyboard focus on no element or out of
 * view, HistoryRouter moves the focus to the page's PageTitle (the one in the
 * deepest route), see `HistoryRouter`. The heading then has `tabindex="-1"`.
 *
 * Pages without a visible heading name themselves with `usePageTitle`.
 * Theme: `CcPageTitle` (default props, style overrides of the root slot).
 * @param props The props, those of MUI's Typography plus disableAutoTitle
 */
const PageTitle = React.forwardRef(function PageTitle(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: "CcPageTitle" });
    const { disableAutoTitle, variant, ...typographyProps } = props;
    const inDialog = useSetFormDialogTitle(!disableAutoTitle, props.children);
    const [element, setElement] = useState(null);
    // the heading element as the router reads it after a navigation, already in
    // the commit that mounts it (element is set one render later)
    const headingRef = useRef(null);
    const handleRef = useForkRef(ref, setElement, headingRef);
    const text = useTextContent(disableAutoTitle ? null : element);
    usePageTitle(inDialog ? null : text);
    usePageHeading(inDialog || disableAutoTitle ? null : headingRef);
    if (inDialog)
        return null;
    return (_jsx(PageTitleRoot, { ref: handleRef, variant: variant ?? "h1", ...typographyProps }));
});
export default React.memo(PageTitle);
