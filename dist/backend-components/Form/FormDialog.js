import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { buttonBaseClasses, Dialog, DialogContent, IconButton, styled, useThemeProps, } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { PushedDialogCloseContext, } from "../../framework/PushedDialogCloseContext";
import { captureError } from "../../framework/ErrorReporting";
import { showConfirmDialog } from "../../non-standalone/Dialog/Utils";
import { DialogTitle } from "../../non-standalone/Dialog/DialogTitle";
import useCCTranslations from "../../utils/useCCTranslations";
import Loader from "../../standalone/Loader";
import combineClassNames from "../../utils/combineClassNames";
import focusRing from "../../utils/internal/focusRing";
const TallDialogContent = styled(DialogContent, {
    name: "CcFormDialog",
    slot: "content",
})({
    height: "80vh",
});
// the size of DialogTitle's close button, which it stands next to
const OpenInNewButton = styled(IconButton, {
    name: "CcFormDialog",
    slot: "openInNewButton",
})(({ theme }) => ({
    padding: `calc(${theme.spacing(1)} / 2)`,
    [`&.${buttonBaseClasses.focusVisible}`]: focusRing(theme, 0),
}));
const OpenInNewIcon = styled(OpenInNew, {
    name: "CcFormDialog",
    slot: "openInNewIcon",
})({});
export const IsInFormDialogContext = React.createContext(false);
export const FormDialogDispatchContext = React.createContext(undefined);
/**
 * The keyboard focus of a dialog whose title can show after it opened. MUI's Dialog focuses
 * its paper (the element with role="dialog") when it opens, and screen readers then announce
 * the dialog with its name, which is its title. A title that shows only later (content that
 * sets it once it has loaded) is not announced. So when the title shows after the dialog has
 * been on screen for a frame with the focus on its paper and no title, the focus moves on to
 * the title heading, and screen readers read the title. Focus the user moved elsewhere stays
 * there, and a title shown when the dialog opens (from the dialogTitle prop, or set by the
 * content as it mounts) leaves the focus on the paper. When the title goes away while it holds
 * the focus (the content that set it unmounts), the paper gets the focus back, rather than the
 * page.
 * @param titleShown Whether the dialog shows a title heading, which its paper's
 * aria-labelledby points at
 * @returns The ref and the focus handler for the dialog's paper
 */
const useLateTitleFocus = (titleShown) => {
    const paperRef = useRef(null);
    // titleShown as of the last commit
    const titleShownRef = useRef(titleShown);
    // the dialog has been on screen for a frame with the focus on its paper and no title: a
    // screen reader has announced it without its title
    const untitledRef = useRef(false);
    // the frame requested when the paper took the focus without a title
    const frameRef = useRef(null);
    const onPaperFocus = useCallback((evt) => {
        if (evt.target !== evt.currentTarget)
            return;
        if (titleShownRef.current || frameRef.current)
            return;
        const win = evt.currentTarget.ownerDocument.defaultView;
        if (!win)
            return;
        const id = win.requestAnimationFrame(() => {
            frameRef.current = null;
            if (!titleShownRef.current)
                untitledRef.current = true;
        });
        frameRef.current = { win, id };
    }, []);
    useEffect(() => () => {
        const frame = frameRef.current;
        frameRef.current = null;
        frame?.win.cancelAnimationFrame(frame.id);
    }, []);
    // a layout effect: it runs before the browser paints, and after React has put back the
    // focus it saved around the commit, which it does not for a removed heading
    useLayoutEffect(() => {
        const wasShown = titleShownRef.current;
        titleShownRef.current = titleShown;
        const paper = paperRef.current;
        if (!paper)
            return;
        const doc = paper.ownerDocument;
        const focused = doc.activeElement;
        if (!titleShown) {
            // the title went away, and the focus with it
            if (wasShown && (!focused || focused === doc.body))
                paper.focus();
            return;
        }
        const late = untitledRef.current;
        untitledRef.current = false;
        if (!late || focused !== paper)
            return;
        const heading = doc.getElementById(paper.getAttribute("aria-labelledby") ?? "");
        if (!heading || !paper.contains(heading))
            return;
        // focusable by script, not a stop of Tab
        if (!heading.hasAttribute("tabindex"))
            heading.setAttribute("tabindex", "-1");
        heading.focus();
    }, [titleShown]);
    return { paperRef, onPaperFocus };
};
/**
 * Keeps the keyboard focus in the dialog when a control of its title row goes away while it
 * holds the focus, e.g. an action of content that unmounts or sets other actions, or the
 * "Open in new tab" button: the dialog's paper gets the focus, rather than the page.
 * @param paperRef The dialog's paper (the element with role="dialog")
 * @param action The controls of the title row, as rendered
 */
const useTitleActionFocusFallback = (paperRef, action) => {
    // action as of the last commit
    const actionRef = useRef(action);
    // a layout effect: the removed control has taken the focus with it, and the browser has
    // not painted yet
    useLayoutEffect(() => {
        const previous = actionRef.current;
        actionRef.current = action;
        if (previous === action)
            return;
        const paper = paperRef.current;
        if (!paper)
            return;
        const doc = paper.ownerDocument;
        const focused = doc.activeElement;
        if (!focused || focused === doc.body)
            paper.focus();
    }, [paperRef, action]);
};
/**
 * The dialog FullFormDialog renders by default (its `renderer`): an MUI `Dialog` with a
 * `DialogTitle` (the title, then in its `action` the content's controls (`titleAction`) and the
 * open-in-new button, and the close button) and the content. The title names the dialog, else
 * `aria-label` does. A title that shows only after the dialog opened takes the keyboard focus if
 * it is still on the dialog itself, so screen readers read it (see `FullFormDialog`). When a
 * control of the title row goes away while it holds the focus, the dialog gets the focus. A
 * custom renderer can render it with changed props.
 * @param props The props of FullFormDialog, with the title to show as `dialogTitle`
 */
export const FormDialogDefaultRenderer = (props) => {
    const { maxWidth, onClose, fullWidth, className, dialogTitle, openInNewLink, titleAction, useCustomClasses, children, "aria-label": ariaLabel, } = props;
    const { t } = useCCTranslations();
    const ContentComp = useCustomClasses ? TallDialogContent : DialogContent;
    const { paperRef, onPaperFocus } = useLateTitleFocus(!!dialogTitle);
    // the paper is the element with role="dialog"; a shown title names it through MUI's
    // aria-labelledby, which wins over aria-label
    const slotProps = useMemo(() => ({
        paper: { "aria-label": ariaLabel, ref: paperRef, onFocus: onPaperFocus },
    }), [ariaLabel, paperRef, onPaperFocus]);
    // a button outside the heading: reachable by Tab, named, and not part of the
    // dialog's name
    const openInNewAction = useMemo(() => {
        if (!openInNewLink)
            return null;
        const openInNew = () => openInNewLink();
        return (_jsx(OpenInNewButton, { "aria-label": t("backend-components.form.form-dialog.open-in-new-tab"), onClick: openInNew, children: _jsx(OpenInNewIcon, {}) }));
    }, [openInNewLink, t]);
    // the content's controls first, then the dialog's own (open in new tab, close), as the tab
    // order goes
    const hasTitleAction = titleAction != null && typeof titleAction !== "boolean";
    const action = useMemo(() => hasTitleAction || openInNewAction ? (_jsxs(_Fragment, { children: [titleAction, openInNewAction] })) : null, [hasTitleAction, titleAction, openInNewAction]);
    useTitleActionFocusFallback(paperRef, action);
    return (_jsxs(Dialog, { maxWidth: maxWidth ?? "lg", open: true, onClose: onClose, fullWidth: fullWidth ?? true, className: combineClassNames(["CcFormDialog", className]), slotProps: slotProps, children: [_jsx(DialogTitle, { onClose: onClose, noTitle: !dialogTitle, action: action, children: dialogTitle }), _jsx(ContentComp, { children: _jsx(Suspense, { fallback: _jsx(Loader, {}), children: children }) })] }));
};
/**
 * A dialog for a form page or other content, opened with `pushDialog`: a title bar with the
 * title, optional controls (`titleAction`), an optional "Open in new tab" button and the close
 * button, and the content below.
 * The content can set the title (`useSetFormDialogTitle`, `PageTitle`) and controls beside it
 * (`useSetFormDialogTitleAction`), guard closing while it has unsaved changes, and close the
 * dialog (`useCloseThisDialog`).
 *
 * The title names the dialog for screen readers, else `aria-label` does. MUI's Dialog puts the
 * keyboard focus on the dialog when it opens, and screen readers announce it with its name. A
 * title that the content sets only once it has loaded comes after that announcement: when it
 * shows while the focus is still on the dialog itself, the focus moves on to the title, so
 * screen readers read it. Focus the user moved elsewhere stays there.
 * Theme: `CcFormDialog` (default props, the slots of `FormDialogClassKey`).
 * @param inProps The props
 */
const FormDialog = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormDialog" });
    const { dialogTitle: titleOverride, onClose, disableFormDialogContext, openInNewLink: openInNewLinkOverride, titleAction: titleActionOverride, renderer, } = props;
    const [pushDialog] = useDialogContext();
    // not useCloseThisDialog, which throws: a FullFormDialog may be rendered without pushDialog,
    // then it closes through onClose. It is the pushed dialog when the nearest close comes from
    // pushDialog; inside another FullFormDialog's content it was rendered without pushDialog.
    const outerClose = useContext(PushedDialogCloseContext);
    const closeThisDialog = outerClose?.pushed ? outerClose.close : null;
    const blockClosingCounter = useRef(0);
    const [title, setTitle] = useState(null);
    const [titleAction, setTitleAction] = useState(null);
    const [openInNewLink, setOpenInNewLink] = useState(null);
    const [titlePriorityMode, setTitlePriorityMode] = useState("prop");
    const { t } = useCCTranslations();
    const handleClose = useCallback(async () => {
        if (blockClosingCounter.current > 0) {
            try {
                await showConfirmDialog(pushDialog, {
                    title: t("backend-components.form.back-on-dirty.title"),
                    message: t("backend-components.form.back-on-dirty.message"),
                    textButtonYes: t("backend-components.form.back-on-dirty.yes"),
                    textButtonNo: t("backend-components.form.back-on-dirty.no"),
                });
            }
            catch {
                return; // user cancelled
            }
        }
        if (!closeThisDialog && !onClose) {
            // eslint-disable-next-line no-console
            console.error(new Error("[Components-Care] FullFormDialog: rendered without pushDialog and without onClose, so it cannot be closed. Show it with pushDialog, or pass an onClose that stops rendering it."));
            return;
        }
        // onClose first: it may close the dialog itself (onClose={popDialog}, or the state of a
        // dialog rendered without pushDialog), and closing this dialog again does nothing
        try {
            onClose?.();
        }
        catch (e) {
            captureError(e, { source: "FullFormDialog.onClose" });
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [FullFormDialog] onClose threw", e);
        }
        closeThisDialog?.();
    }, [t, onClose, closeThisDialog, pushDialog]);
    const blockClosing = useCallback(() => blockClosingCounter.current++, []);
    const unblockClosing = useCallback(() => blockClosingCounter.current--, []);
    const dispatch = useMemo(() => ({
        blockClosing,
        unblockClosing,
        setTitle,
        setTitleAction,
        setOpenInNewLink,
        setTitlePriorityMode,
    }), [blockClosing, unblockClosing]);
    const dialogTitle = titlePriorityMode === "dispatch"
        ? (title ?? titleOverride)
        : (titleOverride ?? title);
    const Renderer = renderer ?? FormDialogDefaultRenderer;
    // the content's useCloseThisDialog closes this dialog; a FullFormDialog rendered in the
    // content without pushDialog sees pushed: false and closes through its own onClose
    const contentClose = useMemo(() => closeThisDialog ? { close: closeThisDialog, pushed: false } : null, [closeThisDialog]);
    return (_jsx(IsInFormDialogContext.Provider, { value: !disableFormDialogContext, children: _jsx(FormDialogDispatchContext.Provider, { value: dispatch, children: _jsx(PushedDialogCloseContext.Provider, { value: contentClose, children: _jsx(Renderer, { ...props, onClose: handleClose, dialogTitle: dialogTitle, openInNewLink: openInNewLink ?? openInNewLinkOverride, titleAction: titleAction ?? titleActionOverride }) }) }) }));
};
export default React.memo(FormDialog);
